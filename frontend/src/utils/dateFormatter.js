// src/utils/dateFormatter.js
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get hours and minutes
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; // Convert to 12-hour format
    hours = hours ? String(hours).padStart(2, '0') : '12'; // Adjust hours

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`; // Format as YYYY-MM-DD HH:mm AM/PM
};
