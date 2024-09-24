/* eslint-disable no-restricted-globals */
// The above line disables the ESLint rule for this file

self.onmessage = (e) => {
    const { episodesData, filters } = e.data;

    const result = episodesData.filter(episode => {
        if (filters.title && !episode.title.toLowerCase().includes(filters.title.toLowerCase())) {
            return false;
        }
        if (filters.seasons.length > 0 && !filters.seasons.includes(episode.info['Season №'])) {
            return false;
        }
        if (filters.writers.length > 0 && !filters.writers.some(writer =>
            (Array.isArray(episode.info['Writer(s)']) ? episode.info['Writer(s)'] : [episode.info['Writer(s)']])
                .includes(writer))) {
            return false;
        }
        if (filters.copyrightYear.length > 0 && !filters.copyrightYear.some(year =>
            (Array.isArray(episode.info['Copyright year']) ? episode.info['Copyright year'] : [episode.info['Copyright year']])
                .includes(year))) {
            return false;
        }
        if (filters.characters.length > 0 && !filters.characters.every(character =>
            episode.characters.includes(character))) {
            return false;
        }
        return true;
    });

    self.postMessage(result);
};