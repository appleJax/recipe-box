const React = require('react'),
    Recipe = require('./Recipe');

class RecipeList extends React.Component {
  render() {
    const {
      recipes,
      filter,
      updateStore,
    } = this.props;

    const regex = filter.filter(val => val !== '').join('|');

    const visibleRecipes = recipes.filter(
      recipe => {
        const text = recipe.name +
          recipe.tags.join(' ') +
          recipe.servings +
          recipe.ingredients.join(' ') +
          recipe.directions.join(' ');

        return text.match(new RegExp(regex, 'i'));
      }
    );

    const recipeList = visibleRecipes.map(
      r => (
        <li key={r.id}>
          <Recipe
            recipe={r}
            filter={filter}
            handleClick={updateStore}
          />
        </li>
      )
    );

    return (
      <ul className="recipe-list">
        {recipeList}
      </ul>
    );
  }
}

module.exports = RecipeList;
