import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUpload } from './file-upload'
import '@testing-library/jest-dom'

describe('FileUpload', () => {
  const mockOnUpload = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    
    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument()
    expect(screen.getByText('or click to browse')).toBeInTheDocument()
    expect(screen.getByText('Browse files')).toBeInTheDocument()
    expect(screen.getByText(/Max size:/)).toBeInTheDocument()
    expect(screen.getByText(/Supported formats:/)).toBeInTheDocument()
  })

  it('renders with custom props', () => {
    const customProps = {
      onUpload: mockOnUpload,
      title: 'Custom Title',
      description: 'Custom Description',
      buttonText: 'Custom Button',
    }

    render(<FileUpload {...customProps} />)
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Description')).toBeInTheDocument()
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })

  it('handles file upload', async () => {
    render(<FileUpload onUpload={mockOnUpload} />)

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')

    Object.defineProperty(input, 'files', {
      value: [file]
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([file])
    })
  })

  it('shows file list', () => {
    const files = [
      new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test2'], 'test2.pdf', { type: 'application/pdf' }),
    ]

    render(
      <FileUpload
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        files={files}
      />
    )

    expect(screen.getByText('test1.pdf')).toBeInTheDocument()
    expect(screen.getByText('test2.pdf')).toBeInTheDocument()

    // Click the first remove button
    const removeButtons = screen.getAllByLabelText(/remove file/i)
    fireEvent.click(removeButtons[0])

    expect(mockOnRemove).toHaveBeenCalledWith(0)
  })

  it('shows upload progress', () => {
    const files = [
      new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
    ]

    render(
      <FileUpload
        onUpload={mockOnUpload}
        files={files}
        uploadProgress={{ 'test1.pdf': 50 }}
      />
    )

    const progressBar = screen.getByLabelText(/upload progress for test1.pdf/i)
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('validates file type', async () => {
    render(<FileUpload onUpload={mockOnUpload} />)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByTestId('file-input')

    Object.defineProperty(input, 'files', {
      value: [file]
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([file])
    })
  })

  it('validates file size', async () => {
    const maxSize = 5 * 1024 // 5KB
    render(<FileUpload onUpload={mockOnUpload} maxSize={maxSize} />)

    const largeFile = new File(['x'.repeat(maxSize + 1)], 'large.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')

    Object.defineProperty(input, 'files', {
      value: [largeFile]
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/is too large/i)).toBeInTheDocument()
    })
  })

  it('handles drag and drop', async () => {
    render(<FileUpload onUpload={mockOnUpload} />)

    const dropzone = screen.getByText('Drag & drop files here').closest('div')
    expect(dropzone).toBeInTheDocument()

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const dataTransfer = {
      files: [file],
      items: [
        {
          kind: 'file',
          type: file.type,
          getAsFile: () => file,
        },
      ],
      types: ['Files'],
    }

    if (dropzone) {
      fireEvent.dragOver(dropzone)
      fireEvent.drop(dropzone, { dataTransfer })
    }

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([file])
    })
  })
}) 