import React from 'react';

// IMPORTANT: This file has a typo in its name ("Biding" instead of "Bidding").
// It should be DELETED from your project.
// The code has been replaced with an error message to prevent it from being used by mistake.
// The correct component is in the file "BiddingModuleSection.tsx".

export const BiddingModuleSection: React.FC = () => {
    return (
        <div style={{ padding: '20px', border: '2px solid red', borderRadius: '8px', backgroundColor: '#fff0f0' }}>
            <h2 style={{ color: 'red', fontWeight: 'bold' }}>Configuration Error: Loading Incorrect Component</h2>
            <p>The application is trying to load a component from the wrong file: <strong>BidingModuleSection.tsx</strong> (note the typo).</p>
            <p>Please <strong>delete this file</strong> to resolve the issue. The correct file is named <strong>BiddingModuleSection.tsx</strong>.</p>
        </div>
    );
};
