import React from 'react';

const BentoCard = ({ children, className = '' }) => {
    return (
        <div className={`bg-white border border-gray-100 rounded-[2rem] p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default BentoCard;
