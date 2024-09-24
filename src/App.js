import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Box, Grid, GridItem, Text, VStack } from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import SkeletonEpisodeCard from './components/SkeletonEpisodeCard';
import FilterBar from './components/FilterBar';
import episodesData from './data/spongebob_episodes.json';

const EpisodeCard = lazy(() => import('./components/EpisodeCard'));

const scrollbarHiddenStyles = {
  '&::WebkitScrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

const ITEMS_PER_LOAD = 50;
const CARD_HEIGHT = 400;

export default function App() {
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [displayedEpisodes, setDisplayedEpisodes] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    seasons: [],
    writers: [],
    copyrightYear: [],
    characters: []
  });
  const [renderTime, setRenderTime] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { writerOptions, copyrightYearOptions, characterOptions, seasonCounts, writerCounts, copyrightYearCounts, characterCounts } = useMemo(() => {
    const writers = new Set();
    const copyrightYears = new Set();
    const characters = new Set();
    const seasons = {};
    const writerCounts = {};
    const copyrightYearCounts = {};
    const characterCounts = {};

    episodesData.forEach(episode => {
      const season = episode.info['Season №'];
      seasons[season] = (seasons[season] || 0) + 1;

      if (episode.info['Writer(s)']) {
        (Array.isArray(episode.info['Writer(s)']) ? episode.info['Writer(s)'] : [episode.info['Writer(s)']]).forEach(writer => {
          writers.add(writer);
          writerCounts[writer] = (writerCounts[writer] || 0) + 1;
        });
      }
      if (episode.info['Copyright year']) {
        (Array.isArray(episode.info['Copyright year']) ? episode.info['Copyright year'] : [episode.info['Copyright year']]).forEach(year => {
          copyrightYears.add(year);
          copyrightYearCounts[year] = (copyrightYearCounts[year] || 0) + 1;
        });
      }
      if (episode.characters) {
        episode.characters.forEach(character => {
          characters.add(character);
          characterCounts[character] = (characterCounts[character] || 0) + 1;
        });
      }
    });

    return {
      writerOptions: Array.from(writers).sort(),
      copyrightYearOptions: Array.from(copyrightYears).sort(),
      characterOptions: Array.from(characters).sort(),
      seasonCounts: seasons,
      writerCounts,
      copyrightYearCounts,
      characterCounts
    };
  }, []);

  const applyFilters = useCallback((newFilters) => {
    console.log('Starting to apply filters:', newFilters);
    const startTime = performance.now();
    setShowSkeleton(true);

    requestAnimationFrame(() => {
      const result = episodesData.filter(episode => {
        if (newFilters.title && !episode.title.toLowerCase().includes(newFilters.title.toLowerCase())) {
          return false;
        }
        if (newFilters.seasons.length > 0 && !newFilters.seasons.includes(episode.info['Season №'])) {
          return false;
        }
        if (newFilters.writers.length > 0 && !newFilters.writers.some(writer =>
          (Array.isArray(episode.info['Writer(s)']) ? episode.info['Writer(s)'] : [episode.info['Writer(s)']])
            .includes(writer))) {
          return false;
        }
        if (newFilters.copyrightYear.length > 0 && !newFilters.copyrightYear.some(year =>
          (Array.isArray(episode.info['Copyright year']) ? episode.info['Copyright year'] : [episode.info['Copyright year']])
            .includes(year))) {
          return false;
        }
        if (newFilters.characters.length > 0 && !newFilters.characters.every(character =>
          episode.characters.includes(character))) {
          return false;
        }
        return true;
      });

      setFilteredEpisodes(result);
      setDisplayedEpisodes(result.slice(0, ITEMS_PER_LOAD));
      const endTime = performance.now();
      const filterTime = (endTime - startTime).toFixed(2);
      console.log(`Filtering completed in ${filterTime} ms. Found ${result.length} episodes.`);
      setRenderTime(filterTime);
      setShowSkeleton(false);
    });
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filter change received in App:', newFilters);
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    console.log('Filters changed, applying new filters');
    applyFilters(filters);
  }, [filters, applyFilters]);

  const isItemLoaded = useCallback((index) => index < displayedEpisodes.length, [displayedEpisodes]);

  const loadMoreItems = useCallback(async (startIndex, stopIndex) => {
    const newItems = filteredEpisodes.slice(startIndex, stopIndex + 1);
    setDisplayedEpisodes(prev => [...prev, ...newItems]);
  }, [filteredEpisodes]);

  const Row = useCallback(({ index, style }) => {
    const episode = displayedEpisodes[index];
    return (
      <div style={{
        ...style,
        height: CARD_HEIGHT,
        paddingBottom: '16px', // Add spacing between cards
      }}>
        <Suspense fallback={<SkeletonEpisodeCard />}>
          {showSkeleton ? (
            <SkeletonEpisodeCard />
          ) : episode ? (
            <EpisodeCard episode={episode} />
          ) : null}
        </Suspense>
      </div>
    );
  }, [displayedEpisodes, showSkeleton]);

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={4} h="100vh" p={4}>
      <GridItem colSpan={3}>
        <FilterBar
          filters={{ ...filters, writerCounts, copyrightYearCounts, characterCounts }}
          onFilterChange={handleFilterChange}
          seasonCounts={seasonCounts}
          writerOptions={writerOptions}
          copyrightYearOptions={copyrightYearOptions}
          characterOptions={characterOptions}
        />
      </GridItem>
      <GridItem colSpan={9}>
        <VStack align="stretch" spacing={4} h="100%">
          <Box bg="white" zIndex={1} py={2} display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="2xl" fontWeight="bold">
              SpongeBob Episodes ({showSkeleton ? '...' : filteredEpisodes.length})
            </Text>
            <Text>Load time: {renderTime} ms</Text>
          </Box>
          <Box flex={1} sx={scrollbarHiddenStyles} overflow="hidden">
            <AutoSizer>
              {({ height, width }) => (
                <InfiniteLoader
                  isItemLoaded={isItemLoaded}
                  itemCount={filteredEpisodes.length}
                  loadMoreItems={loadMoreItems}
                >
                  {({ onItemsRendered, ref }) => (
                    <List
                      height={height}
                      itemCount={filteredEpisodes.length}
                      itemSize={CARD_HEIGHT}
                      onItemsRendered={onItemsRendered}
                      ref={ref}
                      width={width}
                      style={scrollbarHiddenStyles}
                    >
                      {Row}
                    </List>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
}