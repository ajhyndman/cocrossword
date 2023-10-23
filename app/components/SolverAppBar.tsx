import { useSelectionContext } from '~/store/selection';
import BottomAppBar from './BottomAppBar';
import FloatingActionButton from './FloatingActionButton';
import IconButton from './IconButton';

export default () => {
  const { dispatch, selection } = useSelectionContext();

  const handleRotateSelectionClick = () => {
    // if element is already selected, "focus" event won't be triggered
    dispatch({ type: 'ROTATE_SELECTION' });
  };

  return (
    <BottomAppBar
      left={
        <>
          <IconButton name="chat" />
          <IconButton name="info" />
          <IconButton name="check_box" />
          <IconButton name="edit" />
        </>
      }
      right={
        <FloatingActionButton
          name={selection.direction === 'row' ? 'text_rotate_vertical' : 'text_rotation_none'}
          onClick={handleRotateSelectionClick}
        />
      }
    />
  );
};
