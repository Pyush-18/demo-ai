import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, clearCurrentUser } from '../redux/features/tallySlice';


export const useUserContextSync = () => {
  const dispatch = useDispatch();
  const { activeUserId, isPrimaryUser, currentSubUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (activeUserId) {
      dispatch(setCurrentUser(activeUserId));
    } else {
      dispatch(clearCurrentUser());
    }
  }, [activeUserId, dispatch]);

  return {
    activeUserId,
    isPrimaryUser,
    isSubUser: !isPrimaryUser,
    currentSubUser,
  };
};