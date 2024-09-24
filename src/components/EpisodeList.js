import React from 'react';
import { VStack, Text } from '@chakra-ui/react';
import EpisodeCard from './EpisodeCard';

function EpisodeList({ episodes }) {
    return (
        <VStack spacing={6} align="stretch" width="100%">
            <Text fontSize="2xl" fontWeight="bold">Episode List</Text>
            {episodes.map((episode, index) => (
                <EpisodeCard key={index} episode={episode} />
            ))}
        </VStack>
    );
}

export default EpisodeList;