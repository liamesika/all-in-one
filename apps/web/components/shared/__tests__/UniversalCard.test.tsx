import { render, screen } from '@testing-library/react'
import { UniversalCard, CardHeader, CardBody } from '../UniversalCard'

describe('UniversalCard', () => {
  it('renders children', () => {
    render(
      <UniversalCard>
        <div>Card content</div>
      </UniversalCard>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with CardHeader and CardBody', () => {
    render(
      <UniversalCard>
        <CardHeader>
          <h2>Header</h2>
        </CardHeader>
        <CardBody>
          <p>Body content</p>
        </CardBody>
      </UniversalCard>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('applies hoverable styles', () => {
    const { container } = render(
      <UniversalCard hoverable>
        <div>Hoverable card</div>
      </UniversalCard>
    )
    const card = container.firstChild
    expect(card).toHaveClass('hover:shadow-lg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <UniversalCard className="custom-class">
        <div>Custom</div>
      </UniversalCard>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
