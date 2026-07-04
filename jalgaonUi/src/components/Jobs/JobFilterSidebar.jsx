import React, { useState } from 'react';
import './JobFilterSidebar.css';

const JobFilterSidebar = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newFilters = { ...localFilters };
        
        if (type === 'checkbox') {
            if (checked) {
                newFilters.job_type = value;
            } else {
                newFilters.job_type = '';
            }
        } else {
            newFilters[name] = value;
        }

        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const reset = { location: '', job_type: '', salary_min: '' };
        setLocalFilters(reset);
        onFilterChange(reset);
    };

    return (
        <div className="job-filter-sidebar">
            <div className="filter-header">
                <h3>Filters</h3>
                <button className="reset-btn" onClick={resetFilters}>Reset</button>
            </div>
            
            <div className="filter-section">
                <h4>Location</h4>
                <div className="filter-input-wrapper">
                    <i className='bx bx-map'></i>
                    <input 
                        type="text" 
                        name="location" 
                        placeholder="e.g. Jalgaon, Pune" 
                        value={localFilters.location || ''} 
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="filter-section">
                <h4>Job Type</h4>
                <div className="checkbox-group">
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            name="job_type" 
                            value="full_time" 
                            checked={localFilters.job_type === 'full_time'} 
                            onChange={handleInputChange} 
                        />
                        <span className="checkmark"></span>
                        Full Time
                    </label>
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            name="job_type" 
                            value="part_time" 
                            checked={localFilters.job_type === 'part_time'} 
                            onChange={handleInputChange} 
                        />
                        <span className="checkmark"></span>
                        Part Time
                    </label>
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            name="job_type" 
                            value="contract" 
                            checked={localFilters.job_type === 'contract'} 
                            onChange={handleInputChange} 
                        />
                        <span className="checkmark"></span>
                        Contract
                    </label>
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            name="job_type" 
                            value="internship" 
                            checked={localFilters.job_type === 'internship'} 
                            onChange={handleInputChange} 
                        />
                        <span className="checkmark"></span>
                        Internship
                    </label>
                </div>
            </div>

            <div className="filter-section">
                <h4>Minimum Salary (₹)</h4>
                <div className="filter-input-wrapper">
                    <i className='bx bx-rupee'></i>
                    <input 
                        type="number" 
                        name="salary_min" 
                        placeholder="e.g. 15000" 
                        value={localFilters.salary_min || ''} 
                        onChange={handleInputChange}
                        step="5000"
                    />
                </div>
            </div>

            <button className="apply-filter-btn" onClick={applyFilters}>
                Apply Filters
            </button>
        </div>
    );
};

export default JobFilterSidebar;
