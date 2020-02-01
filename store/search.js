/* eslint-disable no-console */
import types from '../constants/types'
import baseURL from '../server/constants/apiURL'

export const state = () => ({
  loading: false,
  errorMessage: null,
  error: false,
  count: null,
  suggestions: null,
  searchQuery: '',
  searchResults: null
})

export const mutations = {
  [types.SET_SEARCH_SUGGESTIONS_LOADING](state, payload) {
    state.loading = payload
  },
  [types.SET_SEARCH_SUGGESTIONS](state, payload) {
    state.loading = false
    state.suggestions = payload.suggestions
    state.searchQuery = payload.searchQuery
  },
  [types.SET_SEARCH_SUGGESTIONS_ERROR](state, payload) {
    state.loading = false
    state.error = true
    state.errorMessage = payload
    state.suggestions = null
  },
  [types.SET_SEARCH_RESULTS_LOADING](state, payload) {
    state.loading = payload
  },
  [types.SET_SEARCH_RESULTS](state, payload) {
    state.searchResults = payload.searchResults
    state.count = payload.count
    state.searchQuery = payload.searchQuery
  },
  [types.SET_SEARCH_RESULTS_ERROR](state, payload) {
    state.error = true
    state.loading = false
    state.searchResults = null
    state.errorMessage = payload
  },
  [types.SET_POST_PUBLISHED](state, payload) {
    // to toggle published status from search results page
    const { _id, published } = payload
    let data = state.searchResults
    if (data) {
      data = data.map((d) => {
        if (d._id === _id) {
          d.published = published
        }
        return d
      })
    }
    state.searchResults = data
  }
}

export const actions = {
  async search({ commit }, query, perPage = 10) {
    const {
      q,
      sortOrder = '-1',
      published = '1',
      sortBy = 'postedDate'
    } = query

    let { page } = query
    page = page ? (isNaN(parseInt(page)) ? 1 : parseInt(page)) : 1
    page = page > 0 ? page : 1

    let url = `${baseURL}/api/search/search?q=${q}`
    if (sortBy) {
      url += `&sortBy=${sortBy}`
    }
    if (sortOrder) {
      url += `&sortOrder=${sortOrder}`
    }
    if (published) {
      url += `&published=${published}`
    }
    if (perPage) {
      url += `&limit=${perPage}`
    }
    if (page) {
      url += `&skip=${(page - 1) * perPage}`
    }
    await commit(types.SET_SEARCH_RESULTS_LOADING, true)
    try {
      let resp = await fetch(url, { credentials: 'include' })
      resp = await resp.json()
      if (resp.error) {
        console.error(resp)
        await commit(
          types.SET_SEARCH_RESULTS_ERROR,
          resp.msg || 'Please try later'
        )
      } else {
        await commit(types.SET_SEARCH_RESULTS, {
          searchResults: resp.data,
          count: resp.count,
          searchQuery: q
        })
      }
    } catch (error) {
      console.error(error)
      await commit(
        types.SET_SEARCH_RESULTS_ERROR,
        error.msg || 'Please try later'
      )
    }
  },
  async searchSuggestions({ commit }, { q, sortBy, sortOrder, published }) {
    let url = `${baseURL}/api/search/suggestions?q=${q}`
    if (sortBy) {
      url += `&sortBy=${sortBy}`
    }
    if (sortOrder) {
      url += `&sortOrder=${sortOrder}`
    }
    if (published) {
      url += `&published=${published}`
    }
    await commit(types.SET_SEARCH_SUGGESTIONS_LOADING, true)

    try {
      let resp = await fetch(url, { credentials: 'include' })
      resp = await resp.json()
      if (resp.error) {
        console.error(resp)
        await commit(
          types.SET_SEARCH_SUGGESTIONS_ERROR,
          resp.msg || 'Please try again later.'
        )
      } else {
        await commit(types.SET_SEARCH_SUGGESTIONS, {
          suggestions: resp.data,
          searchQuery: q
        })
      }
    } catch (error) {
      console.error(error)
      await commit(
        types.SET_SEARCH_SUGGESTIONS_ERROR,
        error.msg || 'Please try again later.'
      )
    }
  },
  async clearSearchSuggestions({ commit }) {
    await commit(types.SET_SEARCH_SUGGESTIONS, {
      suggestions: null,
      searchQuery: ''
    })
  }
}
