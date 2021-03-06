import React from 'react'
import encodeUrl from 'encodeurl'
import { timeFormatter } from '../utils/timeFormatter'
import RecipeBody from './RecipeBody'

const PrivateRecipe = ({
  recipe,
  visibilityFilter,
  user,
  setFilterContent,
  confirmDelete,
  editRecipe,
  duplicateRecipe,
  toggleDetails,
  populateModal,
  publishRecipe,
  unpublishConfirm
}) => {
  const {
    id,
    name,
    tags,
    stars,
    time,
    calories,
    servings,
    ingredients,
    directions,
    notes,
    author,
    canPublish,
    published,
    showDetails
  } = recipe

  const tagList = tags.map(
    (tag, i) =>
    (<li
       key={i}
       onClick={ e => {
         const tagWord = e.target.innerHTML

         if (visibilityFilter.content.includes(tagWord)) {
           return
         } else {
           setFilterContent(
             visibilityFilter.content.concat(tagWord)
           )
         }
       }}
     >
       {tag}
     </li>
    )
  )

  const ingredientList = ingredients.map(
    (ingredient, i) =>
      <li key={i}>{ingredient}</li>
  )

  const directionList = directions.map(
    (direction, i) =>
      <li key={i}>{direction}</li>
  )

  const status = canPublish ?
    (published ?
      <div
        className='recipe__button--passive'
        onClick={unpublishConfirm}
      >
        <i className='fa fa-check-circle'></i>
        Published
      </div> :
      <div
        className='recipe__button--publish'
        onClick={publishRecipe}
      >
        <i className='fa fa-newspaper-o'></i>
        Publish
      </div>) :
      <div
        className='recipe__button--passive recipe__button--disabled'
      >
        <i className='fa fa-cloud-download'></i>
        Downloaded
      </div>

  const starIcons = []

  for (let i = 1; i <= 5; i++) {
    if (i <= stars) {
      starIcons.push(
        <i className='fa fa-star fa-lg'
          key={i}
          data-value={i}
          onClick={ e => {
            const editedRecipe = recipe,
              newStars = Number(e.target.dataset.value)

            delete editedRecipe._id

            if (newStars == 1) {
              editedRecipe.stars = 0

            } else {
              editedRecipe.stars = newStars
            }
              editRecipe(user, editedRecipe, visibilityFilter.active)
          }}
        >
        </i>
      )
    } else {
      starIcons.push(
        <i className='fa fa-star-o fa-lg'
          key={i}
          data-value={i}
          onClick={ e => {
            const editedRecipe = recipe
            editedRecipe.stars = Number(e.target.dataset.value)
            delete editedRecipe._id

            editRecipe(user, editedRecipe, visibilityFilter.active)
          }}
        >
        </i>
      )
    }
  }

  const formatStats = () => {
    const { hours, minutes, hasTime } = timeFormatter(time)
    let result = ''

    if (hasTime) {
      result += hours + minutes
    }

    if (calories > 0)
      result += `\n${calories} cals`

    if (servings > 0)
      result += `\n${servings} servings`

    if (result)
      result += "\n"

    return result
  }

  const emailLink = 'mailto:?subject=' +
  encodeUrl(`${name} Recipe -- theJam`) +
  '&body=' +
  encodeUrl(`RECIPE: ${name}

${ formatStats() }
INGREDIENTS:

${ingredients.map( item => '- ' + item).join("\n")}


DIRECTIONS:

${directions.map( (item, i) => `${i + 1}. ${item}`).join("\n\n")}

${ notes.length > 0 ? "\nNOTES:\n\n" + notes.join("\n") + "\n\n" : ''}
https://thejam-recipes.herokuapp.com
`)

  return (
    <li
      className='recipe'
    >
      <div className='recipe__header'>
        <div
          className='recipe__button--edit'
          onClick={populateModal}
        >
          <i className='fa fa-pencil'></i>
        </div>
        <h2 className='recipe__name'>
          {name}
        </h2>
        <a href={ emailLink } target='_blank' className='mail-recipe'>
          <i className='fa fa-envelope-o'></i>
        </a>
        <ul className='tags'>
          {tagList}
        </ul>
      </div>
      <div className='recipe__control-bar'>
        {starIcons}
        {status}
        <div className='spacer'></div>
        <div
          onClick={toggleDetails}
        >
          <i
            className={
              showDetails ?
              'recipe__expand-toggle fa fa-toggle-up fa-lg' :
              'recipe__expand-toggle fa fa-ellipsis-h fa-lg'
            }
          >
          </i>
        </div>
      </div>
      <div className='spacer control-bar-spacer'></div>
      {showDetails &&
      <div>
        <RecipeBody
          time={time}
          calories={calories}
          servings={servings}
          ingredientList={ingredientList}
          directionList={directionList}
          notes={notes}
        />
      </div>
      }
      {showDetails &&
      <div className="spacer credits-spacer"></div>
      }
      {showDetails &&
      <div className='recipe__credits recipe__credits--private'>
        <div className='recipe__credits__author'>
          <i className='recipe__credits__icon fa fa-id-card-o'></i>
          Recipe By: <span className='credit-name'>{author}</span>
        </div>
        <div className='spacer'></div>
        <div className='recipe__footer-buttons'>
          <div
            className='recipe__button--footer'
            onClick={duplicateRecipe}
          >
            <i className='fa fa-clone fa-lg'></i>
          </div>
          <div
            className='recipe__button--footer recipe__button--delete'
            onClick={confirmDelete}
          >
            <i className='fa fa-times fa-lg'></i>
          </div>
        </div>
      </div>
      }
    </li>
  )
}

export default PrivateRecipe
