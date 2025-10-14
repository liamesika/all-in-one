# EFFINITY Design System - Quick Start Guide

## 5-Minute Setup

### Step 1: Import What You Need

```typescript
// Design system utilities
import { typography, spacing, colors, animations } from '@/lib';

// UI components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Modal,
} from '@/components/ui';

// Enhanced components
import { Badge, StatusBadge, CountBadge } from '@/components/ui/badge';
import { Progress, CircularProgress } from '@/components/ui/progress';
import { Tooltip, SimpleTooltip, InfoTooltip } from '@/components/ui/tooltip';
import { Skeleton, SkeletonCard, LoadingWrapper } from '@/components/ui/skeleton';
```

---

## The 3 Golden Rules

### 1. Typography: Use ONLY 4 Sizes + 2 Weights

```typescript
// ✅ CORRECT
<h1 className={typography.classes.heading1}>Title</h1>        // 24px, Semibold
<h2 className={typography.classes.heading2}>Subtitle</h2>     // 18px, Semibold
<p className={typography.classes.body}>Body text</p>          // 16px, Regular
<span className={typography.classes.small}>Small text</span>  // 14px, Regular

// ❌ WRONG
<h1 style={{ fontSize: '22px', fontWeight: 700 }}>Title</h1>
```

### 2. Spacing: Follow 8pt Grid (4px, 8px, 12px, 16px, 24px, 32px...)

```typescript
// ✅ CORRECT
<div className={spacing.padding.p6}>Content</div>            // 24px padding
<div className={spacing.gap.gap4}>Items</div>                // 16px gap
<div className={spacing.margin.mt8}>Section</div>            // 32px top margin

// ❌ WRONG
<div className="p-5">Content</div>                           // 20px is not 8pt grid aligned
```

### 3. Colors: 60/30/10 Rule (Neutral 60%, Complementary 30%, Accent 10%)

```typescript
// ✅ CORRECT - Accent used sparingly
<div className="bg-white">                                   // 60% neutral
  <h1 className="text-gray-900">Title</h1>                  // 30% complementary
  <Button variant="primary">Action</Button>                 // 10% accent (#2979FF)
</div>

// ❌ WRONG - Too much accent color
<div className="bg-blue-700">
  <h1 className="text-blue-600">Title</h1>
  <Button variant="primary">Action</Button>
</div>
```

---

## Common Patterns

### 1. Page Layout

```typescript
export default function MyPage() {
  return (
    <div className={`${spacing.containers.page} ${animations.page.fadeIn}`}>
      {/* Header */}
      <div className={spacing.stack.stackNormal}>
        <h1 className={typography.classes.heading1}>Page Title</h1>
        <p className={typography.classes.body}>Description text</p>
      </div>

      {/* Content Grid */}
      <div className={`${spacing.grid.grid3Col} ${spacing.margin.mt8}`}>
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  );
}
```

### 2. Interactive Card

```typescript
<Card className={`${animations.hover.cardHover} ${spacing.padding.p6}`}>
  <div className={spacing.stack.stackTight}>
    <Badge variant="success" dot>Active</Badge>
    <h3 className={typography.classes.heading2}>Card Title</h3>
    <p className={typography.classes.body}>Card description</p>
    <Button variant="primary" className={animations.hover.buttonMagnetic}>
      Learn More
    </Button>
  </div>
</Card>
```

### 3. Form with Loading State

```typescript
function MyForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form className={spacing.stack.stackNormal}>
      <div className={spacing.stack.stackTight}>
        <Label htmlFor="name" required>Name</Label>
        <Input
          id="name"
          placeholder="Enter name"
          className={animations.hover.lift}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className={spacing.margin.mt4}
      >
        {loading ? <Spinner size="sm" color="white" /> : 'Submit'}
      </Button>
    </form>
  );
}
```

### 4. Data Table with Loading

```typescript
function DataTable({ data, loading }) {
  if (loading) {
    return <SkeletonTable rows={5} columns={4} />;
  }

  return (
    <div className={animations.page.fadeIn}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className={`${spacing.padding.px6} ${spacing.padding.py3}`}>
              <span className={typography.classes.label}>Name</span>
            </th>
            {/* More headers... */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className={`${spacing.padding.px6} ${spacing.padding.py4}`}>
                <span className={typography.classes.body}>{item.name}</span>
              </td>
              {/* More cells... */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Status Dashboard

```typescript
function StatusDashboard() {
  return (
    <div className={spacing.grid.grid3Col}>
      {/* Success Stat */}
      <Card className={spacing.padding.p6}>
        <div className={spacing.stack.stackTight}>
          <StatusBadge status="active" />
          <h3 className={typography.classes.heading2}>24</h3>
          <p className={typography.classes.small}>Active Properties</p>
          <Progress value={85} variant="success" />
        </div>
      </Card>

      {/* Warning Stat */}
      <Card className={spacing.padding.p6}>
        <div className={spacing.stack.stackTight}>
          <StatusBadge status="pending" />
          <h3 className={typography.classes.heading2}>12</h3>
          <p className={typography.classes.small}>Pending Reviews</p>
          <Progress value={45} variant="warning" />
        </div>
      </Card>

      {/* Info Stat */}
      <Card className={spacing.padding.p6}>
        <div className={spacing.stack.stackTight}>
          <Badge variant="info">New</Badge>
          <h3 className={typography.classes.heading2}>8</h3>
          <p className={typography.classes.small}>New Leads</p>
          <Progress value={30} variant="info" />
        </div>
      </Card>
    </div>
  );
}
```

### 6. Modal with Form

```typescript
function EditModal({ isOpen, onClose, item }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle>Edit Property</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <form className={spacing.stack.stackNormal}>
          <div className={spacing.stack.stackTight}>
            <Label htmlFor="name">Property Name</Label>
            <Input id="name" defaultValue={item?.name} />
          </div>

          <div className={spacing.stack.stackTight}>
            <Label htmlFor="status">Status</Label>
            <Select id="status" options={statusOptions} />
          </div>
        </form>
      </ModalContent>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary">
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

---

## Accessibility Checklist

Every component should have:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus-visible indicators
- ✅ Sufficient color contrast (WCAG AA+)
- ✅ Loading states with aria-busy
- ✅ Error states with aria-invalid

```typescript
// Good example
<button
  aria-label="Delete property"
  aria-describedby="delete-warning"
  className="focus-visible:ring-2 focus-visible:ring-blue-700"
>
  Delete
</button>
<span id="delete-warning" className="sr-only">
  This action cannot be undone
</span>
```

---

## RTL Support

All components automatically support RTL. Use logical properties:

```typescript
// ✅ CORRECT - Works in both LTR and RTL
<div className={spacing.logical.ps4}>      // padding-inline-start: 16px
<div className={spacing.logical.me2}>      // margin-inline-end: 8px

// ❌ WRONG - Doesn't flip in RTL
<div className="pl-4">                     // padding-left: 16px (fixed)
<div className="mr-2">                     // margin-right: 8px (fixed)
```

---

## Performance Tips

1. **Use CSS animations over JavaScript**
   ```typescript
   // ✅ CORRECT
   <div className={animations.hover.lift}>

   // ❌ WRONG
   <div onMouseEnter={() => setHovered(true)}>
   ```

2. **GPU acceleration for smooth animations**
   ```typescript
   <div className="gpu-accelerated">
     Content with animations
   </div>
   ```

3. **Loading states prevent layout shifts**
   ```typescript
   <LoadingWrapper isLoading={loading} skeleton={<SkeletonCard />}>
     <ActualContent />
   </LoadingWrapper>
   ```

---

## Cheat Sheet

### Typography
- `typography.classes.heading1` → 24px, Semibold
- `typography.classes.heading2` → 18px, Semibold
- `typography.classes.body` → 16px, Regular
- `typography.classes.small` → 14px, Regular

### Spacing (8pt grid)
- `spacing.padding.p2` → 8px
- `spacing.padding.p4` → 16px
- `spacing.padding.p6` → 24px
- `spacing.padding.p8` → 32px

### Colors
- `colors.brand.royalBlue` → #2979FF (10% usage)
- `colors.neutral.light.bg50` → #FAFBFC (60% usage)
- `colors.gray.gray700` → #374151 (30% usage)

### Animations
- `animations.page.fadeIn` → Page entrance
- `animations.hover.cardHover` → Card hover effect
- `animations.loading.shimmer` → Loading shimmer

### Components
- `<Button variant="primary">` → Brand accent button
- `<Badge variant="success">` → Success badge
- `<Progress value={75}>` → Linear progress
- `<Tooltip content="Info">` → Tooltip

---

## Need Help?

1. **Full Documentation:** `/apps/web/DESIGN_SYSTEM.md`
2. **Implementation Report:** `/apps/web/PHASE_5.1_IMPLEMENTATION_REPORT.md`
3. **Component Source Code:** `/apps/web/components/ui/`
4. **Design System Libraries:** `/apps/web/lib/`

---

## Quick Commands

```bash
# View design system files
ls -lh apps/web/lib/{animations,typography,spacing,colors}.ts

# View component files
ls -lh apps/web/components/ui/{badge,progress,skeleton,tooltip}.tsx

# Read documentation
cat apps/web/DESIGN_SYSTEM.md
```

---

**Remember:** Consistency is key! Follow the 3 Golden Rules and you'll create a professional, accessible, and performant user interface.

Happy coding! 🚀
