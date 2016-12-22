import React from 'react'

class VoteDialogue extends React.Component {
  constructor(props) {
    super(props)
    const {
      user,
      recipe
    } = this.props

    const stars = recipe.votes[user] || 0

    this.state = {
      stars
    }
  }

  render() {
    const {
      user,
      recipe,
      voteForRecipe,
      closeModal
    } = this.props

    const starIcons = []

    for (let i = 1; i <= 5; i++) {
      if (i <= this.state.stars) {
        starIcons.push(
          <i className='fa fa-star fa-2x'
            key={i}
            data-value={i}
            onClick={ e => {
              let stars = e.target.dataset.value

              if (this.state.stars == 1) {
                stars = 0
              }

              this.setState({stars})
            }}
          >
          </i>
        )
      } else {
        starIcons.push(
          <i className='fa fa-star-o fa-2x'
            key={i}
            data-value={i}
            onClick={ e => {
              let stars = e.target.dataset.value
              this.setState({stars})
            }}
          >
          </i>
        )
      }
    }

    return (
    <div
      className='confirm-dialogue'
      onClick={ e =>
        e.stopPropagation()
      }
    >
      <h3
        className='confirm-dialogue__message'
      >
        Your Vote
      </h3>
      <div className='confirm-dialogue__stars'>
        {starIcons}
      </div>
      <div className='confirm-dialogue__button-bar'>
        <div
          className='confirm-dialogue__button confirm-dialogue__button--accept'
          onClick={() => {
            voteForRecipe(user, this.state.stars, recipe)
            closeModal()
          }}
        >
          Vote
        </div>
        <div
          className='confirm-dialogue__button confirm-dialogue__button--cancel'
          onClick={closeModal}
        >
          Cancel
        </div>
      </div>
    </div>
  )}
}

export default VoteDialogue