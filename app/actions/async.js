import fetch from 'isomorphic-fetch'
import uuidV4 from 'uuid/v4'
import {
  addRecipe,
  editRecipe,
  deleteRecipe,
  populateUserRecipes,
  toggleAddToUserAnime,
  populateModal
} from './sync'

export const fetchRecipes = (user) =>
  dispatch => {
    fetch(`https://thejam-recipes.herokuapp.com/recipes`,
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

export const addUserRecipe = (user, recipe, active) =>
  dispatch => {
    dispatch(addRecipe(recipe, active))

    const newRecipe = {
      ...recipe,
      showDetails: false
    }

    return fetch(`https://thejam-recipes.herokuapp.com/new`,
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

export const duplicateRecipe = (user, recipe) =>
  dispatch => {
    const newRecipe = {
      ...recipe,
      id: uuidV4(),
      published: false,
      name: 'Copy of ' + recipe.name
    }
    delete newRecipe._id

    dispatch(addUserRecipe(user, newRecipe, 'private'))
    dispatch(populateModal('recipe', newRecipe))

    const altRecipe = {
      ...recipe,
      showDetails: false
    },
      altNewRecipe = {
        ...newRecipe,
        showDetails: false
      }

    dispatch(editRecipe(altRecipe, 'private'))

    return fetch(`https://thejam-recipes.herokuapp.com/new`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: altNewRecipe})
      }
    )
    .catch(console.error)
  }

export const editUserRecipe = (user, recipe, active) =>
  dispatch => {
    dispatch(editRecipe(recipe, active))

    const newRecipe = {
      ...recipe,
      showDetails: false
    }

    fetch(`https://thejam-recipes.herokuapp.com/edit`,
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
      fetch(`https://thejam-recipes.herokuapp.com/find`,
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
        const tempRecipe = {...recipe},
              oldPubRecipe = response,
              publisher = oldPubRecipe.publisher,
              vote = tempRecipe.stars,
              votes = oldPubRecipe.votes

        votes[publisher] = vote
        if (vote == 0) delete votes[publisher]

        const totalVotes = Object.keys(votes).length
        let totalStars = 0

        for (let voter in votes) totalStars += votes[voter]

        const stars = Math.ceil(totalStars / totalVotes)

        delete oldPubRecipe._id
        delete tempRecipe.published
        delete tempRecipe.stars

        if (tempRecipe.author == 'Me' || tempRecipe.author == 'me') {
          tempRecipe.author = oldPubRecipe.publisher
        }

        const newPubRecipe = {
          ...oldPubRecipe,
          ...tempRecipe,
          votes,
          stars
        }

        dispatch(editRecipe(newPubRecipe, 'public'))
        newPubRecipe.showDetails = false

        fetch(`https://thejam-recipes.herokuapp.com/edit`,
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

export const deleteUserRecipe = (user, recipe, active) =>
  dispatch => {
    dispatch(deleteRecipe(recipe, active))

    return fetch(`https://thejam-recipes.herokuapp.com/delete`,
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
    delete publicRecipe.canPublish
    delete publicRecipe.published

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

    const newPublicRecipe = {
      ...publicRecipe,
      showDetails: false
    },
      newPrivateRecipe = {
        ...privateRecipe,
        showDetails: false
      }

    fetch(`https://thejam-recipes.herokuapp.com/new`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user: 'public', recipe: newPublicRecipe})
      }
    )
    .catch(console.error)

    fetch(`https://thejam-recipes.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newPrivateRecipe})
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

    const newPrivateRecipe = {
      ...newRecipe,
      showDetails: false
    }

    fetch(`https://thejam-recipes.herokuapp.com/delete`,
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


    fetch(`https://thejam-recipes.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user, recipe: newPrivateRecipe})
      }
    )
    .catch(console.error)
  }

export const addToUserRecipes = (user, recipe) =>
  dispatch => {
    const newRecipe = {
      ...recipe,
      stars: 0,
      canPublish: false,
      published: false,
      showDetails: false,
      id: uuidV4()
    }
    delete newRecipe.votes
    delete newRecipe._id
    delete newRecipe.publisher

    dispatch(toggleAddToUserAnime(recipe.id))
    setTimeout(() => {
      dispatch(toggleAddToUserAnime(''))
    }, 2300)
    dispatch(addRecipe(newRecipe, 'private'))

    return fetch(`https://thejam-recipes.herokuapp.com/new`,
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

export const voteForRecipe = (user, vote, recipe, email) =>
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

    const dbRecipe = {
      ...newRecipe,
      showDetails: false
    }

    fetch(`https://thejam-recipes.herokuapp.com/edit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({user: 'public', recipe: dbRecipe})
      }
    )
    .catch(console.error)

    if (recipe.publisher == user) {
      fetch(`https://thejam-recipes.herokuapp.com/find`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors',
          cache: 'default',
          body: JSON.stringify({user: email, recipe: {id: recipe.id}})
        }
      )
      .then(response => {
        if (response.status >= 400) {
          throw new Error("Bad response from server")
        }
        return response.json()
      })
      .then(response => {
        const privateRecipe = response
        privateRecipe.stars = vote

        delete privateRecipe._id

        dispatch(editRecipe(privateRecipe, 'private'))
        const newPrivateRecipe = {
          ...privateRecipe,
          showDetails: false
        }

        fetch(`https://thejam-recipes.herokuapp.com/edit`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({user: email, recipe: newPrivateRecipe})
          }
        )
      })
      .catch(console.error)
    }
  }
