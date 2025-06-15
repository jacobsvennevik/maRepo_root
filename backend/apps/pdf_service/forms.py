from django import forms
from .django_models import Document

class DocumentUploadForm(forms.ModelForm):
    """
    A form for uploading a document file. It validates the file extension
    against allowed file types and ensures a title is provided.
    """

    class Meta:
        model = Document
        fields = ['file', 'title', 'upload_type', 'file_type']

    def clean_file(self):
        file = self.cleaned_data.get('file')
        if file:
            # Get the file extension from the uploaded file's name.
            ext = file.name.split('.')[-1].lower()
            allowed_extensions = ['pdf', 'ppt', 'pptx', 'mp3', 'wav', 'ogg']
            if ext not in allowed_extensions:
                raise forms.ValidationError("Unsupported file extension.")
            # Set the file_type based on the extension
            self.cleaned_data['file_type'] = ext
        return file

    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title:
            raise forms.ValidationError("Title is required for document uploads.")  # ✅ Ensure title is required
        return title
