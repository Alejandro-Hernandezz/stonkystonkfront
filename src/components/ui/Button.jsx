export default function Button({ 
  children, 
  loading = false, 
  className = '', 
  variant = 'primary',
  size = 'normal',
  full = false,
  disabled = false,
  ...props 
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'normal' ? `btn-${size}` : '';
  const fullClass = full ? 'btn-full' : '';
  const loadingClass = loading ? 'loading' : '';
  
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${fullClass} ${loadingClass} ${className}`.trim();

  return (
    <button 
      {...props} 
      disabled={loading || disabled}
      className={classes}
    >
      {loading && <div className="btn-spinner"></div>}
      {children}
    </button>
  );
}