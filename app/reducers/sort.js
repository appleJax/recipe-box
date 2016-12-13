import { SET_SORT } from '../actions/sync'

const sort = (
  state = {
    stars: false,
    asc: false,
    desc: false
  },
  action
) => {
  switch (action.type) {
    case SET_SORT:
      switch (action.sortBy) {
        case 'STARS':
          return {
            ...state,
            stars: !state.stars
          }
        case 'ASC':
            return {
              ...state,
              asc: !state.asc,
              desc: false
            }
        case 'DESC':
          return {
            ...state,
            asc: false,
            desc: !state.desc
          }
        default:
          return state
      }
    default:
      return state
  }
}

export default sort
