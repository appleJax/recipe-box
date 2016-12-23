import fetch from 'isomorphic-fetch'
import {
  addRecipe,
  editRecipe,
  deleteRecipe,
  populateUserRecipes
} from './sync'

export const fetchRecipes = (user) => {
  return dispatch => {
    // update UI... (todo)

    return fetch(`https://thejam.herokuapp.com/recipes`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify(user)
      }
    )
    .then(json => dispatch(populateUserRecipes(json)))
    .catch(console.error)
  }
}

export const addUserRecipe = (user, recipe, active) => {
  return dispatch => {
    dispatch(addRecipe(recipe, active))

    const newRecipe = {
      ...recipe,
      showDetails: false
    }

    return fetch(`https://thejam.herokuapp.com/new`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newRecipe})
      }
    )
    .catch(console.error)
  }
}

export const editUserRecipe = (user, recipe, active) => {
  return dispatch => {
    dispatch(editRecipe(recipe, active))

    const newRecipe = {
      ...recipe,
      showDetails: false
    }

    fetch(`https://thejam.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newRecipe})
      }
    )
    .catch(console.error)

    if (recipe.published) {
      fetch(`https://thejam.herokuapp.com/find`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors',
          cache: 'default',
          body: JSON.stringify({user: 'public', recipe: {id: recipe.id}})
        }
      )
      .then(response => {
        if (response.status >= 400) {
          throw new Error("Bad response from server")
        }
        return response.json()
      })
      .then(response => {
        console.log('Recipe:', recipe)
        console.log('Response:', response)
        const tempRecipe = recipe,
              oldPubRecipe = response
        delete oldPubRecipe._id
        delete tempRecipe.published
        delete tempRecipe.stars

        if (tempRecipe.author == 'Me' || tempRecipe.author == 'me') {
          oldPubRecipe.author = oldPubRecipe.publisher
        }

        const newPubRecipe = {
          ...oldPubRecipe,
          ...tempRecipe
        }

        dispatch(editRecipe(newPubRecipe, 'public'))
        newPubRecipe.showDetails = false

        fetch(`https://thejam.herokuapp.com/edit`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({user: 'public', recipe: newPubRecipe})
          }
        )
      })
      .catch(console.error)
    }
  }
}

export const deleteUserRecipe = (user, recipe, active) =>
  dispatch => {
    dispatch(deleteRecipe(recipe, active))

    return fetch(`https://thejam.herokuapp.com/delete`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe})
      }
    )
    .catch(console.error)
  }

export const publishRecipe = (user, recipe, publisher) =>
  dispatch => {
    const publicRecipe = {
      ...recipe,
      votes: {},
      publisher
    }
    delete publicRecipe._id

    if (recipe.author == 'Me' || recipe.author == 'me') {
      publicRecipe.author = publisher
    }

    if (recipe.stars > 0) {
      publicRecipe.votes[publisher] = recipe.stars
    }

    const privateRecipe = {
      ...recipe,
      published: true
    }
    delete privateRecipe._id

    dispatch(addRecipe(publicRecipe, 'public'))
    dispatch(editRecipe(privateRecipe, 'private'))

    publicRecipe.showDetails = false
    privateRecipe.showDetails = false

    fetch(`https://thejam.herokuapp.com/new`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user: 'public', recipe: publicRecipe})
      }
    )
    .catch(console.error)

    fetch(`https://thejam.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: privateRecipe})
      }
    )
    .catch(console.error)
  }

export const unpublishRecipe = (user, recipe) =>
  dispatch => {
    const newRecipe = {
      ...recipe,
      published: false
    }
    delete newRecipe._id

    dispatch(deleteRecipe(recipe, 'public'))
    dispatch(editRecipe(newRecipe, 'private'))

    newRecipe.showDetails = false

    fetch(`https://thejam.herokuapp.com/delete`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user: 'public', recipe})
      }
    )
    .catch(console.error)


    fetch(`https://thejam.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newRecipe})
      }
    )
    .catch(console.error)
  }

export const addToUserRecipes = (user, recipe) =>
  dispatch => {
    const newRecipe = {
      ...recipe,
      stars: 0,
      published: false,
      showDetails: false,
      id: Date.now()
    }
    delete newRecipe.votes
    delete newRecipe.author
    delete newRecipe._id

    dispatch(addRecipe(newRecipe, 'private'))

    return fetch(`https://thejam.herokuapp.com/new`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newRecipe})
      }
    )
    .catch(console.error)
  }

export const voteForRecipe = (user, vote, recipe) =>
  dispatch => {
    const votes = recipe.votes
    votes[user] = vote
    if (vote == 0) delete votes[user]

    const totalVotes = Object.keys(votes).length
    let totalStars = 0

    for (let voter in votes) totalStars += votes[voter]

    const stars = Math.ceil(totalStars / totalVotes)

    const newRecipe = {
      ...recipe,
      stars,
      votes
    }
    delete newRecipe._id

    dispatch(editRecipe(newRecipe, 'public'))
    newRecipe.showDetails = false

    fetch(`https://thejam.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user: 'public', recipe: newRecipe})
      }
    )
    .catch(console.error)
  }
