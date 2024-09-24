import React, { useState, useCallback, useEffect } from 'react';
import { VStack, Input, Button, CheckboxGroup, Checkbox, Text, Box } from '@chakra-ui/react';

function FilterBar({ filters, onFilterChange, seasonCounts, writerOptions, copyrightYearOptions, characterOptions }) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [deferredFilters, setDeferredFilters] = useState(filters);

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (JSON.stringify(localFilters) !== JSON.stringify(deferredFilters)) {
                console.log('Applying filters:', localFilters);
                setDeferredFilters(localFilters);
                onFilterChange(localFilters);
            }
        }, 300);

        return () => clearTimeout(timerId);
    }, [localFilters, deferredFilters, onFilterChange]);

    const handleInputChange = (e) => {
        console.log('Title filter changed:', e.target.value);
        setLocalFilters(prev => ({ ...prev, title: e.target.value }));
    };

    const handleMultiSelectChange = useCallback((field) => (selectedValues) => {
        console.log(`${field} filter changed:`, selectedValues);
        setLocalFilters(prev => ({ ...prev, [field]: selectedValues }));
    }, []);

    const handleResetFilters = () => {
        console.log('Filters reset');
        const resetFilters = {
            title: '',
            seasons: [],
            writers: [],
            copyrightYear: [],
            characters: []
        };
        setLocalFilters(resetFilters);
        setDeferredFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const renderCheckboxGroup = useCallback((title, options, field, counts) => (
        <Box>
            <Text fontWeight="bold">{title}:</Text>
            <CheckboxGroup colorScheme="blue" value={localFilters[field]} onChange={handleMultiSelectChange(field)}>
                <VStack align="start" spacing={1} maxH="200px" overflowY="auto">
                    {options.map((option) => (
                        <Checkbox key={option} value={option}>
                            {`${option} (${counts[option] || 0})`}
                        </Checkbox>
                    ))}
                </VStack>
            </CheckboxGroup>
        </Box>
    ), [localFilters, handleMultiSelectChange]);

    return (
        <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold">Filters</Text>
            <Input
                value={localFilters.title}
                onChange={handleInputChange}
                placeholder="Search by title"
            />
            {renderCheckboxGroup("Select seasons", Object.keys(seasonCounts), "seasons", seasonCounts)}
            {renderCheckboxGroup("Select Writers", writerOptions, "writers", filters.writerCounts)}
            {renderCheckboxGroup("Select Copyright Year", copyrightYearOptions, "copyrightYear", filters.copyrightYearCounts)}
            {renderCheckboxGroup("Select Characters", characterOptions, "characters", filters.characterCounts)}
            <Button colorScheme="red" onClick={handleResetFilters}>Reset Filters</Button>
        </VStack>
    );
}

export default React.memo(FilterBar);