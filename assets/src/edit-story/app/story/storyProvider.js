/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Context from './context';

import useLoadStory from './effects/useLoadStory';
import useCurrentPage from './effects/useCurrentPage';
import useHistoryEntry from './effects/useHistoryEntry';
import useHistoryReplay from './effects/useHistoryReplay';
import useSelectedElements from './effects/useSelectedElements';

import useAddBlankPage from './actions/useAddBlankPage';
import useClearSelection from './actions/useClearSelection';
import useToggleElementIdInSelection from './actions/useToggleElementIdInSelection';
import useSelectElementById from './actions/useSelectElementById';
import useAppendElementToCurrentPage from './actions/useAppendElementToCurrentPage';
import useSetCurrentPageByIndex from './actions/useSetCurrentPageByIndex';
import useSetPropertiesOnSelectedElements from './actions/useSetPropertiesOnSelectedElements';
import useSavePost from './actions/useSavePost';

function StoryProvider( { storyId, children } ) {
	// Story state is stored in these three immutable variables only!
	// Don't update 1 of these in an effect based off another base variable.
	// Only update these directly as a response to user or api interactions.
	const [ pages, setPages ] = useState( [] );
	const [ title, setTitle ] = useState( [] );
	const [ postStatus, setPostStatus ] = useState( [] );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ currentPageIndex, setCurrentPageIndex ] = useState( null );
	const [ selectedElementIds, setSelectedElementIds ] = useState( [] );

	// These states are all derived from the above three variables and help keep the api easier.
	// These will update based off the above in effects but should never be directly manipulated outside this component.
	const [ currentPageNumber, setCurrentPageNumber ] = useState( null );
	const [ currentPage, setCurrentPage ] = useState( null );
	const [ selectedElements, setSelectedElements ] = useState( [] );

	const hasSelection = Boolean( selectedElementIds.length );

	const clearSelection = useClearSelection( { selectedElementIds, setSelectedElementIds } );
	const setCurrentPageByIndex = useSetCurrentPageByIndex( { clearSelection, setCurrentPageIndex } );
	const addBlankPage = useAddBlankPage( { pages, setPages, clearSelection } );
	const selectElementById = useSelectElementById( { setSelectedElementIds } );
	const toggleElementIdInSelection = useToggleElementIdInSelection( { selectedElementIds, setSelectedElementIds } );
	const appendElementToCurrentPage = useAppendElementToCurrentPage( { currentPageIndex, pages, setPages, setSelectedElementIds } );
	const setPropertiesOnSelectedElements = useSetPropertiesOnSelectedElements( { currentPageIndex, pages, selectedElementIds, setPages } );
	const savePost = useSavePost( { isSaving, storyId, title, postStatus, pages, setPostStatus,	setIsSaving } );

	useLoadStory( { storyId, pages, setPages, setTitle, setPostStatus, setCurrentPageIndex, clearSelection } );
	useCurrentPage( { currentPageIndex, pages, setCurrentPage, setCurrentPageNumber } );
	useHistoryEntry( { currentPageIndex, pages, selectedElementIds } );
	useHistoryReplay( { setCurrentPageIndex, setPages, setSelectedElementIds } );
	useSelectedElements( { currentPageIndex, pages, selectedElementIds, setSelectedElements } );

	const state = {
		state: {
			pages,
			currentPageIndex,
			currentPageNumber,
			currentPage,
			selectedElementIds,
			selectedElements,
			hasSelection,
			title,
			postStatus,
			isSaving,
		},
		actions: {
			setCurrentPageByIndex,
			addBlankPage,
			clearSelection,
			appendElementToCurrentPage,
			toggleElementIdInSelection,
			selectElementById,
			setPropertiesOnSelectedElements,
			savePost,
		},
	};

	return (
		<Context.Provider value={ state }>
			{ children }
		</Context.Provider>
	);
}

StoryProvider.propTypes = {
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node,
	] ).isRequired,
	storyId: PropTypes.number,
};

export default StoryProvider;