const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatDateToAPI = (dateString: string): string => {
    if (!dateString) return '';
    // Expected input: YYYY-MM-DD
    const [year, monthNum, day] = dateString.split('-');
    if (!year || !monthNum || !day) return dateString;

    const monthIdx = parseInt(monthNum, 10) - 1;
    const monthName = MONTH_NAMES[monthIdx];

    return `${day.padStart(2, '0')}-${monthName}-${year}`;
};

export const formatDateFromAPI = (apiDateString: string): string => {
    if (!apiDateString) return '';
    // Expected input: dd-MMM-yyyy (e.g., 18-Jan-2026)
    const [day, monthName, year] = apiDateString.split('-');
    if (!day || !monthName || !year) return apiDateString;

    const monthIdx = MONTH_NAMES.indexOf(monthName);
    const monthNum = String(monthIdx + 1).padStart(2, '0');

    return `${year}-${monthNum}-${day.padStart(2, '0')}`;
};
