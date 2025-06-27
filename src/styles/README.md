# CSS Organization

This directory contains all CSS styles for the BG3 Tracker project, organized following Vite best practices.

## File Structure

```
src/styles/
├── main.css          # Main CSS file - imports all styles and defines global styles
├── achievements.css  # Component-specific styles for achievements
└── README.md        # This file
```

## Usage

### Import in your main entry point (e.g., main.tsx or App.tsx):
```ts
import './styles/main.css'
```

### Or import specific files:
```ts
import './styles/achievements.css'
```

## CSS Custom Properties

The project uses CSS custom properties (variables) defined in `main.css`:

- `--primary-color`: Main background color (#1b1c1d)
- `--secondary-color`: Border and secondary elements (#3e3f42)
- `--text-color`: Primary text color (#f1f1f1)
- `--text-secondary`: Secondary text color (#ccc)
- `--background-color`: Component background (#2d2e30)

## Best Practices

1. **Use CSS custom properties** for colors and common values
2. **Keep component styles separate** in their own files
3. **Import through main.css** for global styles
4. **Use descriptive class names** that follow BEM or similar conventions
5. **Keep styles modular** and reusable

## Adding New Styles

1. Create a new CSS file for your component (e.g., `button.css`)
2. Import it in `main.css`
3. Use CSS custom properties for consistency
4. Follow the existing naming conventions 