import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../UniversalBadge'

describe('StatusBadge', () => {
  it('renders with completed status', () => {
    render(<StatusBadge status="completed">Complete</StatusBadge>)
    const badge = screen.getByText('Complete')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100')
  })

  it('renders with failed status', () => {
    render(<StatusBadge status="failed">Failed</StatusBadge>)
    const badge = screen.getByText('Failed')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('renders with active status', () => {
    render(<StatusBadge status="active">Active</StatusBadge>)
    const badge = screen.getByText('Active')
    expect(badge).toHaveClass('bg-blue-100')
  })

  it('renders with pending status', () => {
    render(<StatusBadge status="pending">Pending</StatusBadge>)
    const badge = screen.getByText('Pending')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('applies custom className', () => {
    render(<StatusBadge status="completed" className="custom">Custom</StatusBadge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom')
  })
})
