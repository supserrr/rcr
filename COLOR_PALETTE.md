# Rwanda Cancer Relief - Color Palette

Cancer awareness purple-inspired color system for light and dark modes.

---

## 🎨 Color Palette Overview

### Primary Color
**Cancer Purple** - The signature cancer awareness ribbon color
- Represents hope, compassion, and healing
- Used for primary actions, buttons, and key elements

### Supporting Colors
- **Lavender** - Soft, calming secondary color
- **Light Purple** - Subtle backgrounds and muted elements
- **Deep Purple** - Accent and emphasis

---

## 💡 Light Mode Colors

### Primary
- **Primary:** Rich cancer purple `oklch(0.55 0.18 300)`
- **Primary Foreground:** Nearly white with purple tint

### Background & Text
- **Background:** Nearly white with subtle purple tint
- **Foreground:** Dark with purple tint
- **Muted:** Very light purple
- **Muted Foreground:** Soft purple gray

### UI Elements
- **Card:** Pure white
- **Border:** Light purple tint
- **Input:** Light purple tint
- **Ring:** Cancer purple focus ring

### Accent Colors
- **Secondary:** Soft lavender
- **Accent:** Brighter hope purple

---

## 🌙 Dark Mode Colors

### Primary
- **Primary:** Bright cancer purple `oklch(0.70 0.20 300)`
- Adjusted for visibility on dark backgrounds

### Background & Text
- **Background:** Dark with purple tint
- **Foreground:** Nearly white with purple tint
- **Muted:** Dark purple tint
- **Muted Foreground:** Soft purple

### UI Elements
- **Card:** Slightly lighter than background
- **Border:** Subtle purple
- **Input:** Subtle purple
- **Ring:** Bright purple focus ring

---

## 🎯 Usage in Components

### Buttons
```tsx
<Button>Primary Action</Button>           // Cancer purple
<Button variant="secondary">Secondary</Button>  // Lavender
<Button variant="outline">Outline</Button>      // Purple border
```

### Text
```tsx
<h1 className="text-foreground">Title</h1>
<p className="text-muted-foreground">Subtitle</p>
```

### Backgrounds
```tsx
<div className="bg-background">Main background</div>
<div className="bg-secondary">Soft lavender section</div>
<div className="bg-muted">Light purple section</div>
```

### Borders & Accents
```tsx
<div className="border border-border">Subtle purple border</div>
<div className="bg-primary text-primary-foreground">Purple accent</div>
```

---

## 🎨 Chart Colors

For data visualization, five purple harmony colors:
1. **Chart 1:** Cancer purple
2. **Chart 2:** Soft purple
3. **Chart 3:** Light purple
4. **Chart 4:** Deep lavender
5. **Chart 5:** Warm purple

---

## 🌓 Theme Toggle

Users can switch between light and dark mode:
- **Toggle button** in top-right corner
- **Sun icon** for light mode
- **Moon icon** for dark mode
- Smooth transitions between modes

---

## 💜 Color Meanings

### Why Purple?

**Cancer Awareness Purple:**
- Universal color for all cancer awareness
- Represents hope, survival, and support
- Compassionate and calming
- Professional and trustworthy

**Color Psychology:**
- **Lavender:** Healing, calm, peace
- **Deep Purple:** Dignity, respect, care
- **Soft Purple:** Gentle, supportive, comforting

---

## 🎯 Design Principles

### Accessibility
- ✅ WCAG 2.1 AA compliant contrast ratios
- ✅ Clear text on all backgrounds
- ✅ Focus rings for keyboard navigation
- ✅ Color-blind friendly purple shades

### Consistency
- ✅ Purple tint throughout all elements
- ✅ Harmonious color relationships
- ✅ Smooth transitions between themes
- ✅ Unified brand experience

### Emotional Design
- ✅ Calming and supportive
- ✅ Professional and trustworthy
- ✅ Hope and healing
- ✅ Compassionate care

---

## 🔧 Customizing Colors

To adjust the color palette, edit:
```
shared/ui/src/styles/globals.css
```

### Light Mode
```css
:root {
  --primary: oklch(0.55 0.18 300);  /* Adjust here */
}
```

### Dark Mode
```css
.dark {
  --primary: oklch(0.70 0.20 300);  /* Adjust here */
}
```

---

## 📊 Quick Reference

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary Button | Rich purple | Bright purple |
| Background | White w/ purple tint | Dark w/ purple tint |
| Text | Dark purple | Light purple |
| SVG Path | Cancer purple | Bright purple |
| Borders | Light purple | Subtle purple |
| Cards | White | Dark purple |

---

## 🚀 How to Use

### Toggle Dark Mode
Click the sun/moon icon in the top-right corner!

### In Your Code
Colors automatically adapt based on theme:
```tsx
<div className="bg-primary text-primary-foreground">
  This is purple in both light and dark mode!
</div>
```

---

**Last Updated:** October 21, 2025  
**Theme:** Cancer Awareness Purple  
**Modes:** Light & Dark  
**Toggle Location:** Top-right corner of page

