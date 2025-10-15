import { render, screen, fireEvent } from '@testing-library/react'
import { UniversalButton } from '../UniversalButton'

describe('UniversalButton', () => {
  it('renders with text', () => {
    render(<UniversalButton>Click me</UniversalButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<UniversalButton onClick={handleClick}>Click</UniversalButton>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with primary variant', () => {
    render(<UniversalButton variant="primary">Primary</UniversalButton>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('bg-[#2979FF]')
  })

  it('renders with outline variant', () => {
    render(<UniversalButton variant="outline">Outline</UniversalButton>)
    const button = screen.getByText('Outline')
    expect(button).toHaveClass('border-gray-300')
  })

  it('shows loading state', () => {
    render(<UniversalButton loading>Loading</UniversalButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('can be disabled', () => {
    render(<UniversalButton disabled>Disabled</UniversalButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders with left icon', () => {
    const Icon = () => <span data-testid="icon">Icon</span>
    render(<UniversalButton leftIcon={<Icon />}>With Icon</UniversalButton>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
