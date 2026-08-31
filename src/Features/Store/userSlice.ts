import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from 'Features/Schema/types'

interface UserState {
  profile: User | null
}

const initialState: UserState = {
  profile: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload
    },
    clearUserProfile: (state) => {
      state.profile = null
    },
  },
})

export const { setUserProfile, clearUserProfile } = userSlice.actions
export const userReducer = userSlice.reducer
