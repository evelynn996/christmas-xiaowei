interface OverlayProps {
  isTreeShape: boolean
  onToggle: () => void
}

export function Overlay({ isTreeShape, onToggle }: OverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(135deg, #ff69b4 0%, #da70d6 50%, #a0d2eb 100%)',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 105, 180, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(255, 105, 180, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.4)'
        }}
      >
        {isTreeShape ? '✨ Scatter Magic' : '🎄 Assemble Tree'}
      </button>
    </div>
  )
}
