from django import forms
from maProject.apps.documents.models import Document

class DocumentUploadForm(forms.ModelForm):
    """
    A form for uploading a document file. It validates the file extension
    against allowed file types.
    """
    
    class Meta:
        model = Document
        fields = ['file', 'file_type']
    
    def clean_file(self):
        file = self.cleaned_data.get('file')
        if file:
            # Get the file extension from the uploaded file's name.
            ext = file.name.split('.')[-1].lower()
            allowed_extensions = ['pdf', 'ppt', 'pptx', 'mp3', 'wav', 'ogg']
            if ext not in allowed_extensions:
                raise forms.ValidationError("Unsupported file extension.")
        return file
