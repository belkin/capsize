import React, { ChangeEvent, useRef, useState } from 'react';
import {
  Input,
  Box,
  Button,
  FormLabel,
  VisuallyHidden,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/core';
import { fromBlob } from 'capsize/metrics';

import { useAppState } from '../AppStateContext';
import { fontTypeFromUrl } from './fontTypeFromUrl';

export default function FileUploadSelector() {
  const { dispatch } = useAppState();
  const [filename, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box>
      <VisuallyHidden>
        <FormLabel htmlFor="fileUpload">Font file</FormLabel>
      </VisuallyHidden>
      <InputGroup size="lg">
        <Input
          aria-hidden="true"
          placeholder="Upload a file"
          value={filename}
          onChange={() => {}}
          onClick={() => {
            if (message) {
              setMessage('');
            }
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          borderRadius={16}
          paddingRight={20}
          isInvalid={Boolean(message)}
          _focus={{ boxShadow: 'outline' }}
        />
        <InputRightElement width="85px">
          <Button
            size="sm"
            borderRadius={12}
            color="gray.600"
            onClick={() => {
              if (message) {
                setMessage('');
              }
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            Browse
          </Button>
        </InputRightElement>
      </InputGroup>
      <Input
        id="fileUpload"
        type="file"
        ref={fileInputRef}
        aria-describedby={message ? 'fileUploadErrorMessage' : undefined}
        onChange={async (ev: ChangeEvent<HTMLInputElement>) => {
          if (ev.currentTarget.files && ev.currentTarget.files[0]) {
            const file = ev.currentTarget.files[0];
            setFileName(file.name);

            try {
              const metrics = await fromBlob(file);

              const reader = new FileReader();

              reader.addEventListener(
                'load',
                () => {
                  dispatch({
                    type: 'UPDATE_FONT',
                    value: {
                      metrics,
                      font: {
                        source: 'FILE_UPLOAD',
                        url: reader.result as string,
                        type: fontTypeFromUrl(file.name),
                      },
                    },
                  });
                },
                false,
              );

              reader.readAsDataURL(file);
            } catch (e) {
              setMessage('Something went wrong. Please try again.');
            }
          } else {
            setMessage('No files to upload. Please try again.');

            // eslint-disable-next-line no-console
            console.error('No files on target', ev.currentTarget);
          }
        }}
        accept=".ttf, .otf, .woff, .woff2, .ttc"
        pos="absolute"
        top={0}
        opacity={0}
        width={0}
      />
      {message ? (
        <Text
          id="fileUploadErrorMessage"
          pos="absolute"
          paddingY={2}
          paddingX={4}
          color="red.500"
        >
          {message}
        </Text>
      ) : null}
    </Box>
  );
}
