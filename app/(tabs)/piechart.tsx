import Svg, { Circle } from 'react-native-svg'

interface PieChart{
    known: number
    review: number
    unknown: number
    size?: number
    width?: number
}

export function PieChart({known, review, unknown, size=150,width=20}: PieChart){
    const total = known + review + unknown
    const radius = (size-width)/2
    const circumference = 2 * Math.PI * radius
    const center = size/2
    const getStrokeArray = (value: number) => {
        const percent = value/total
        const length = circumference * percent
        return `${length} ${circumference}`
    }
    const knownOffset = 0, reviewOffset = -(circumference * (known/total)), unknownOffset = -(circumference * ((known+review)/total))
    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{rotate: '-90deg'}] }}>
            <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#334155"
                strokeWidth={width}
                fill="none"
            />
            {known > 0 && (
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#10B981"
                    strokeWidth={width}
                    fill="none"
                    strokeDasharray={getStrokeArray(known)}
                    strokeDashoffset={knownOffset}
                />
            )}
            {review > 0 && (
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#F59E0B"
                    strokeWidth={width}
                    fill="none"
                    strokeDasharray={getStrokeArray(review)}
                    strokeDashoffset={reviewOffset}
                />
            )}
            {unknown > 0 && (
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#EF4444"
                    strokeWidth={width}
                    fill="none"
                    strokeDasharray={getStrokeArray(unknown)}
                    strokeDashoffset={unknownOffset}
                />
            )}
        </Svg>
    )
}