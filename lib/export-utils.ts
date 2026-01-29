// Utility functions for exporting booking details

export async function saveToPDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // @ts-ignore - Dynamic import for client-side only
    const html2pdf = await import('html2pdf.js')
    
    const opt = {
      margin: 1,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    
    // @ts-ignore - Library types are not perfect
    html2pdf.default().set(opt).from(element).save()
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export async function saveToImage(element: HTMLElement, filename: string): Promise<void> {
  try {
    // @ts-ignore - Dynamic import for client-side only
    const html2canvas = await import('html2canvas')
    
    const canvas = await html2canvas.default(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL()
    link.click()
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)
  } catch (error) {
    console.error('Failed to generate image:', error)
    throw new Error('Failed to generate image')
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw new Error('Failed to copy to clipboard')
  }
}
