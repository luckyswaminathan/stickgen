import '../app/styles/standing-stick-figure.css'

interface StandingStickFigureProps {
  isWalking?: boolean;
  className?: string;
}

export function StandingStickFigure({ isWalking = true, className = '' }: StandingStickFigureProps) {
  return (
    <div 
      className={`standing-stick-figure ${isWalking ? 'walking' : ''} ${className}`}
    >
      {'   O    O    O    O\n' +
       '  /|\\  /|\\  /|\\  /|\\\n' +
       '  / \\  / \\  / \\  / \\'}
    </div>
  )
} 