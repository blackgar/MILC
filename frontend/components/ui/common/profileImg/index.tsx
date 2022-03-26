import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";

interface IUserProps {
  proImg: string;
  userId: number;
}

interface IEditProfileImgForm {
  proImg: FileList;
}

interface IEditProfileImgResponse {
  message: string;
  statusCode: number;
  user: any;
}

export default function ProfileImg({ proImg, userId }: IUserProps) {
  console.log(proImg, userId);

  // input 값 받아옴
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IEditProfileImgForm>();

  // 이미지 미리보기
  const [proImgPreview, setProImgPreview] = useState(""); // 미리보기 변수
  const proImgUpload = watch("proImg"); //
  useEffect(() => {
    if (proImgUpload && proImgUpload.length > 0) {
      const file = proImgUpload[0];
      setProImgPreview(URL.createObjectURL(file));
    }
  }, [proImgUpload]);

  // useUser로 불러온 프로필 이미지를 미리보기에 저장
  useEffect(() => {
    if (proImg)
      setProImgPreview(
        `https://imagedelivery.net/VMYwPRIpsXwlX0kB6AjPIA/${proImg}/avatar`
      );
  }, [proImg]);

  // onValid form data DB에 요청
  const [editProfileImg, { data, loading }] =
    useMutation<IEditProfileImgResponse>(`/api/user/pro`, "PUT");

  // form 제출 시 실행
  const onValid = async (formData: IEditProfileImgForm) => {
    if (loading) return;

    if (
      window.confirm("현재 사진으로 프로필 사진을 수정하시겠습니까?") == true
    ) {
      if (
        formData.proImg &&
        formData.proImg.length > 0
        // proImg
      ) {
        console.log(formData);
        const { uploadURL } = await (await fetch(`/api/files`)).json();
        const form = new FormData();
        form.append("file", formData.proImg[0], userId + "");
        const {
          result: { id },
        } = await (
          await fetch(uploadURL, {
            method: "POST",
            body: form,
          })
        ).json();
        editProfileImg({
          imgUrl: id,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="mb-7">
      <div className="flex items-center justify-center pb-2 font-bold">
        프로필 사진
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gold"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div>
        <label htmlFor="proImg" className="cursor-pointer">
          {proImgPreview ? (
            <img
              src={proImgPreview}
              className="h-[150px] w-[150px] mb-8 rounded-full"
            ></img>
          ) : (
            <div className="h-[150px] w-[150px] bg-basicImage hover:bg-gray-300 rounded-full"></div>
          )}
          <input
            {...register("proImg")}
            id="proImg"
            type="file"
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>
    </form>
  );
}
