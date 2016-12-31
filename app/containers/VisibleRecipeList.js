import { connect } from 'react-redux'
import {
  populateModal,
  setFilterContent,
  toggleDetails,
} from '../actions/sync'
import {
  editUserRecipe,
  duplicateRecipe,
  publishRecipe,
  unpublishRecipe,
  addToUserRecipes
} from '../actions/async'
import RecipeList from '../components/RecipeList'

const getVisibleRecipes = (recipes, visibilityFilter, sort) => {
  const regex = visibilityFilter.content
                .filter(val => val !== '')
                .join('|')

  const activeRecipes = recipes[visibilityFilter.active]

  return activeRecipes
    .filter(
      recipe => {
        const text = [
          recipe.name,
          ...recipe.tags,
          recipe.servings,
          ...recipe.ingredients,
          ...recipe.directions,
          recipe.author,
          recipe.publisher
        ].join(' ')

      return text.match(new RegExp(regex, 'i'));
    }
  ).sort((a, b) => {
    if (sort.time && sort.stars && sort.asc) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == timeB) {
        if (a.stars == b.stars) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        }
        return b.stars - a.stars
      }
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else if (sort.time && sort.stars && sort.desc) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == timeB) {
        if (a.stars == b.stars) {
          return a.name > b.name ? -1 : a.name < b.name ? 1 : 0
        }
        return b.stars - a.stars
      }
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else if (sort.time && sort.stars) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == timeB) {
        return b.stars - a.stars
      }
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else if (sort.time && sort.asc) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == timeB) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else if (sort.time && sort.desc) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == timeB) {
        return a.name > b.name ? -1 : a.name < b.name ? 1 : 0
      }
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else if (sort.stars && sort.asc) {
      if (a.stars == b.stars) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
      return b.stars - a.stars

    } else if (sort.stars && sort.desc) {
      if (a.stars == b.stars) {
        return a.name > b.name ? -1 : a.name < b.name ? 1 : 0
      }
      return b.stars - a.stars

    } else if (sort.asc) {
      if (a.name == b.name) return 0
      return a.name < b.name ? -1 : 1

    } else if (sort.desc) {
      if (a.name == b.name) return 0
      return a.name > b.name ? -1 : 1

    } else if (sort.stars) {
      return b.stars - a.stars

    } else if (sort.time) {
      const timeA = a.time.hours * 60 + a.time.minutes,
            timeB = b.time.hours * 60 + b.time.minutes
      if (timeA == 0) return 1
      if (timeB == 0) return -1
      return timeA - timeB

    } else {
      return 0
    }
  })
}

const mapStateToProps = (state) => {
  return {
    recipes: getVisibleRecipes(state.recipes, state.visibilityFilter, state.sort),
    visibilityFilter: state.visibilityFilter,
    user: state.auth.email,
    username: state.auth.name,
    privateView: state.visibilityFilter.active == 'private',
    loggedIn: state.auth.isAuthenticated,
    addToUserAnime: state.animation.addToUserRecipes
  }
}

const mapDispatchTProps = (dispatch) =>
  ({
    setFilterContent: (filter) =>
      dispatch(setFilterContent(filter)),

    editRecipe: (user, recipe, active) =>
      dispatch(editUserRecipe(user, recipe, active)),

    duplicateRecipe: (user, recipe) =>
      dispatch(duplicateRecipe(user, recipe)),

    toggleDetails: (id, active) =>
      dispatch(toggleDetails(id, active)),

    populateModal: (dialogue, content) => {
      document.body.classList.add('no-scroll')
      dispatch(populateModal(dialogue, content))
    },

    publishRecipe: (user, recipe, publisher) =>
      dispatch(publishRecipe(user, recipe, publisher)),

    unpublishRecipe: (user, recipe) =>
      dispatch(unpublishRecipe(user, recipe)),

    addToUserRecipes: (user, recipe) =>
      dispatch(addToUserRecipes(user, recipe))
  })

const VisibleRecipeList = connect(
  mapStateToProps,
  mapDispatchTProps
)(RecipeList)

export default VisibleRecipeList
