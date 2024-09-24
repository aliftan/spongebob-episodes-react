import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Flex, Text, VStack, HStack, Button } from '@chakra-ui/react';
import EpisodeCard from './components/EpisodeCard';
import FilterBar from './components/FilterBar';
import episodesData from './data/spongebob_episodes.json';

const ITEMS_PER_PAGE = 20;

export default function App() {
  const [episodes, setEpisodes] = useState([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [visibleEpisodes, setVisibleEpisodes] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    seasons: [],
    writers: [],
    animation: [],
    copyrightYear: [],
    characters: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [renderTime, setRenderTime] = useState(0);
  const startTimeRef = useRef(0);

  const [writerOptions, animationOptions, copyrightYearOptions, characterOptions] = useMemo(() => {
    const writers = new Set();
    const animations = new Set();
    const copyrightYears = new Set();
    const characters = new Set();

    episodesData.forEach(episode => {
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

    return [
      Array.from(writers).sort(),
      Array.from(animations).sort(),
      Array.from(copyrightYears).sort(),
      Array.from(characters).sort()
    ];
  }, []);

  const applyFilters = useCallback((data) => {
    let result = data;
    if (filters.title) {
      result = result.filter(episode =>
        episode.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    if (filters.seasons.length > 0) {
      result = result.filter(episode =>
        filters.seasons.includes(episode.info['Season №'])
      );
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
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    startTimeRef.current = performance.now();
    setEpisodes(episodesData);
    applyFilters(episodesData);
  }, [applyFilters]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setVisibleEpisodes(filteredEpisodes.slice(startIndex, endIndex));
    const endTime = performance.now();
    setRenderTime((endTime - startTimeRef.current).toFixed(2));
  }, [filteredEpisodes, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(episodes);
  };

  const seasonCounts = useMemo(() => {
    const counts = {};
    episodesData.forEach(episode => {
      const season = episode.info['Season №'];
      counts[season] = (counts[season] || 0) + 1;
    });
    return counts;
  }, []);

  const totalPages = Math.ceil(filteredEpisodes.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
      <VStack flex={1} align="stretch" overflowY="auto" spacing={4}>
        <Flex justify="space-between" align="center" position="sticky" top={0} bg="white" zIndex={1} py={2}>
          <Text fontSize="2xl" fontWeight="bold">
            SpongeBob Episodes ({filteredEpisodes.length})
          </Text>
          <Text>Load time: {renderTime} ms</Text>
        </Flex>
        {visibleEpisodes.map((episode, index) => (
          <EpisodeCard key={index} episode={episode} />
        ))}
        <HStack justify="center" mt={4}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>Page {currentPage} of {totalPages}</Text>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}