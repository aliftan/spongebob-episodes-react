import React, { useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Tag, Wrap, WrapItem, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

function EpisodeCard({ episode, onLoad }) {
    useEffect(() => {
        if (onLoad) onLoad();
    }, [onLoad]);

    if (!episode || !episode.info) {
        return <Box>Episode information not available</Box>;
    }

    const {
        title,
        info: {
            'Season №': season,
            'Episode №': episodeNumber,
            'Airdate': airdate,
            'Running time': runningTime,
            'Writer(s)': writers,
            'Production code': productionCode,
        },
        characters,
        url,
    } = episode;

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" bg="white">
            <VStack align="stretch" spacing={3}>
                <Heading as="h3" size="md">{title || 'Unknown Title'}</Heading>

                <HStack>
                    <Text fontWeight="bold">Season: {season || 'N/A'}</Text>
                    <Text fontWeight="bold">Episode: {episodeNumber || 'N/A'}</Text>
                </HStack>

                <Text><strong>Airdate:</strong> {airdate || 'Unknown'}</Text>
                <Text><strong>Running time:</strong> {runningTime || 'Unknown'}</Text>

                {writers && (
                    <Box>
                        <Text fontWeight="bold">Writers:</Text>
                        <Wrap>
                            {(Array.isArray(writers) ? writers : [writers]).map((writer, index) => (
                                <WrapItem key={index}>
                                    <Tag size="md" variant="solid" colorScheme="blue">
                                        {writer}
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                )}

                {characters && Array.isArray(characters) && (
                    <Box>
                        <Text fontWeight="bold">Characters:</Text>
                        <Wrap>
                            {characters.map((character, index) => (
                                <WrapItem key={index}>
                                    <Tag size="sm" variant="outline" colorScheme="green">
                                        {character}
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                )}

                {productionCode && (
                    <Text fontSize="sm" color="gray.500">
                        <strong>Production code:</strong> {Array.isArray(productionCode) ? productionCode.join(', ') : productionCode}
                    </Text>
                )}

                {url && (
                    <Link href={url} isExternal color="blue.500">
                        More Info <ExternalLinkIcon mx="2px" />
                    </Link>
                )}
            </VStack>
        </Box>
    );
}

export default EpisodeCard;