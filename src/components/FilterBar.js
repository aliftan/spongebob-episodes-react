import React from 'react';
import { VStack, Input, Button, CheckboxGroup, Checkbox, Text, Box } from '@chakra-ui/react';

function FilterBar({ filters, onFilterChange, seasonCounts, writerOptions, animationOptions, copyrightYearOptions, characterOptions }) {
    const handleInputChange = (e) => {
        onFilterChange({ ...filters, title: e.target.value });
    };

    const handleMultiSelectChange = (field) => (selectedValues) => {
        onFilterChange({ ...filters, [field]: selectedValues });
    };

    const handleApplyFilters = () => {
        onFilterChange({ ...filters });
    };

    const renderCheckboxGroup = (title, options, field) => (
        <Box>
            <Text fontWeight="bold">{title}:</Text>
            <CheckboxGroup colorScheme="blue" value={filters[field]} onChange={handleMultiSelectChange(field)}>
                <VStack align="start" spacing={1} maxH="200px" overflowY="auto">
                    {options.map((option, index) => (
                        <Checkbox key={index} value={option}>
                            {field === 'seasons' ? `Season ${option} (${seasonCounts[option]})` : option}
                        </Checkbox>
                    ))}
                </VStack>
            </CheckboxGroup>
        </Box>
    );

    return (
        <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold">Filters</Text>
            <Input
                value={filters.title}
                onChange={handleInputChange}
                placeholder="Search by title"
            />
            {renderCheckboxGroup("Select seasons", Object.keys(seasonCounts), "seasons")}
            {renderCheckboxGroup("Select Writers", writerOptions, "writers")}
            {renderCheckboxGroup("Select Animation", animationOptions, "animation")}
            {renderCheckboxGroup("Select Copyright Year", copyrightYearOptions, "copyrightYear")}
            {renderCheckboxGroup("Select Characters", characterOptions, "characters")}
            <Button colorScheme="blue" onClick={handleApplyFilters}>Apply Filters</Button>
        </VStack>
    );
}

export default FilterBar;