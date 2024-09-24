import React from 'react';
import { Box, VStack, Skeleton } from '@chakra-ui/react';

function SkeletonEpisodeCard() {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" bg="white">
            <VStack align="stretch" spacing={3}>
                <Skeleton height="24px" width="70%" />
                <Skeleton height="20px" width="40%" />
                <Skeleton height="16px" width="60%" />
                <Skeleton height="16px" width="50%" />
                <VStack align="stretch" spacing={2}>
                    <Skeleton height="16px" width="30%" />
                    <Skeleton height="24px" width="80%" />
                </VStack>
                <VStack align="stretch" spacing={2}>
                    <Skeleton height="16px" width="30%" />
                    <Skeleton height="24px" width="90%" />
                </VStack>
                <Skeleton height="16px" width="70%" />
                <Skeleton height="16px" width="40%" />
            </VStack>
        </Box>
    );
}

export default SkeletonEpisodeCard;