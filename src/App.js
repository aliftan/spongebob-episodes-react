import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import EpisodeCard from './components/EpisodeCard';
import FilterBar from './components/FilterBar';
import episodesData from './data/spongebob_episodes.json';

export default function App() {
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    seasons: [],
    writers: [],
    animation: [],
    copyrightYear: [],
    characters: []
  });
  const [renderTime, setRenderTime] = useState(0);
  const startTimeRef = useRef(0);

  const { writerOptions, animationOptions, copyrightYearOptions, characterOptions, seasonCounts } = useMemo(() => {
    const writers = new Set();
    const animations = new Set();
    const copyrightYears = new Set();
    const characters = new Set();
    const seasons = {};

    episodesData.forEach(episode => {
      const season = episode.info['Season №'];
      seasons[season] = (seasons[season] || 0) + 1;

      if (episode.info['Writer(s)']) {
        (Array.isArray(episode.info['Writer(s)']) ? episode.info['Writer(s)'] : [episode.info['Writer(s)']]).forEach(writer => writers.add(writer));
      }
      if (episode.info['Animation']) {
        (Array.isArray(episode.info['Animation']) ? episode.info['Animation'] : [episode.info['Animation']]).forEach(animation => animations.add(animation));
      }
      if (episode.info['Copyright year']) {
        (Array.isArray(episode.info['Copyright year']) ? episode.info['Copyright year'] : [episode.info['Copyright year']]).forEach(year => copyrightYears.add(year));
      }
      if (episode.characters) {
        episode.characters.forEach(character => characters.add(character));
      }
    });

    return {
      writerOptions: Array.from(writers).sort(),
      animationOptions: Array.from(animations).sort(),
      copyrightYearOptions: Array.from(copyrightYears).sort(),
      characterOptions: Array.from(characters).sort(),
      seasonCounts: seasons
    };
  }, []);

  const applyFilters = useCallback(() => {
    startTimeRef.current = performance.now();
    let result = episodesData;

    if (filters.title) {
      const lowercaseTitle = filters.title.toLowerCase();
      result = result.filter(episode => episode.title.toLowerCase().includes(lowercaseTitle));
    }
    if (filters.seasons.length > 0) {
      result = result.filter(episode => filters.seasons.includes(episode.info['Season №']));
    }
    if (filters.writers.length > 0) {
      result = result.filter(episode =>
        filters.writers.some(writer =>
          (Array.isArray(episode.info['Writer(s)']) ? episode.info['Writer(s)'] : [episode.info['Writer(s)']])
            .includes(writer)
        )
      );
    }
    if (filters.animation.length > 0) {
      result = result.filter(episode =>
        filters.animation.some(anim =>
          (Array.isArray(episode.info['Animation']) ? episode.info['Animation'] : [episode.info['Animation']])
            .includes(anim)
        )
      );
    }
    if (filters.copyrightYear.length > 0) {
      result = result.filter(episode =>
        filters.copyrightYear.some(year =>
          (Array.isArray(episode.info['Copyright year']) ? episode.info['Copyright year'] : [episode.info['Copyright year']])
            .includes(year)
        )
      );
    }
    if (filters.characters.length > 0) {
      result = result.filter(episode =>
        filters.characters.every(character => episode.characters.includes(character))
      );
    }

    setFilteredEpisodes(result);
    const endTime = performance.now();
    setRenderTime((endTime - startTimeRef.current).toFixed(2));
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      <EpisodeCard episode={filteredEpisodes[index]} />
    </div>
  ), [filteredEpisodes]);

  return (
    <Flex h="100vh" p={4}>
      <Box w="250px" mr={4}>
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          seasonCounts={seasonCounts}
          writerOptions={writerOptions}
          animationOptions={animationOptions}
          copyrightYearOptions={copyrightYearOptions}
          characterOptions={characterOptions}
        />
      </Box>
      <VStack flex={1} align="stretch" spacing={4}>
        <Flex justify="space-between" align="center" bg="white" zIndex={1} py={2}>
          <Text fontSize="2xl" fontWeight="bold">
            SpongeBob Episodes ({filteredEpisodes.length})
          </Text>
          <Text>Load time: {renderTime} ms</Text>
        </Flex>
        <Box flex={1}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={filteredEpisodes.length}
                itemSize={370}
                width={width}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </Box>
      </VStack>
    </Flex>
  );
}