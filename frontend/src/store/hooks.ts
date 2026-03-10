// This file defines custom hooks for using the Redux store in a React application.
// use dispatch-allow to dispatch actions with the correct types.
//  useSelector-allowing you to select state from the Redux store with type safety.

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
