import React from 'react';

const StatsCard = ({ title, value, icon, className = '' }) => {
    return (
        <div className={`admin-stat-card ${className}`}>
            <div className="admin-stat-icon">
                {icon}
            </div>
            <div className="admin-stat-info">
                <h4>{title}</h4>
                <p>{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
