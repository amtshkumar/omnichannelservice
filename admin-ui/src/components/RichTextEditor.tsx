import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Enter content here...', 
  height = '200px' 
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link'
  ];

  return (
    <Box
      sx={{
        '.quill': {
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'gray.200',
          _focusWithin: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
        '.ql-toolbar': {
          borderTopRadius: 'md',
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          backgroundColor: 'gray.50',
        },
        '.ql-container': {
          borderBottomRadius: 'md',
          fontSize: 'md',
          minHeight: height,
        },
        '.ql-editor': {
          minHeight: height,
        },
        '.ql-editor.ql-blank::before': {
          color: 'gray.400',
          fontStyle: 'normal',
        },
      }}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default RichTextEditor;
