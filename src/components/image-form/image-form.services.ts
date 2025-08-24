import { UpdateImage, UploadImage, DeleteImage } from './image-form.types';

const ENDPOINT = '/images';

export const uploadImage: UploadImage = async ({
  image,
  newImage,
  imageFile,
  authAxios,
  onUploadProgress,
  onSuccess,
  onError,
}) => {
  let result = null;
  try {
    const body = new FormData();
    body.set('image', imageFile);
    if (newImage) {
      const newImageEntries = Object.entries(newImage);
      for (const [k, v] of newImageEntries) {
        body.set(k, v);
      }
      body.delete('src');
    }
    let url: string, method: 'post' | 'put';
    if (image) {
      url = `${ENDPOINT}/${image.id}`;
      method = 'put';
    } else {
      url = ENDPOINT;
      method = 'post';
    }
    const { data } = await authAxios<
      NonNullable<Awaited<ReturnType<UploadImage>>>
    >({
      onUploadProgress,
      data: body,
      method,
      url,
    });
    onSuccess?.(data);
    result = data;
  } catch (error) {
    onError?.(error);
  }
  return result;
};

export const updateImage: UpdateImage = async ({
  newImage,
  authAxios,
  image: { id, ...oldImage },
  onSuccess,
  onError,
}) => {
  let result = null;
  try {
    const url = `${ENDPOINT}/${id}`;
    const body = { ...oldImage, ...newImage };
    const { data } = await authAxios.put<
      NonNullable<Awaited<ReturnType<UpdateImage>>>
    >(url, body);
    onSuccess?.(data);
    result = data;
  } catch (error) {
    onError?.(error);
  }
  return result;
};

export const deleteImage: DeleteImage = async ({
  image: { id },
  authAxios,
  onSuccess,
  onError,
}) => {
  try {
    await authAxios.delete<null>(`${ENDPOINT}/${id}`);
    onSuccess?.();
  } catch (error) {
    onError?.(error);
  }
};
