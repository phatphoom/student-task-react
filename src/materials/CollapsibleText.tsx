import React, { useState } from 'react';

type Props = {
    text: string;
    maxLength?: number;
};

export default function CollapsibleText(props: Props) {
    const { text, maxLength = 100 } = props;

    const [isExpanded, setIsExpanded] = useState(false);

    const isLong = text.length > maxLength;
    const displayText =
        isExpanded || !isLong ? text : text.slice(0, maxLength) + '...';

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    return (
        <p>
            {displayText}
            {isLong && (
                <span
                    onClick={toggleExpand}
                    style={{
                        color: 'blue',
                        cursor: 'pointer',
                        marginLeft: '8px',
                    }}
                >
                    {isExpanded ? 'Show less' : 'Show more'}
                </span>
            )}
        </p>
    );
};

