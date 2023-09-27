import { UploadOutlined } from "@ant-design/icons";
import { Button, FormInstance, Upload, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { useState } from "react";
import { PreviewImage } from "../../../assets/images/imageAssets";

import "./index.scss";

const ImageUploader = ({ formInstance }: { formInstance: FormInstance }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const editCoverImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    if (newFileList[0]?.originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }

    formInstance.setFieldValue("logoImage", newFileList[0].originFileObj);

    console.log("uploading done")
  };

  return (
    <div className="d-flex justify-content-between">
      <div>
        <p className="token-details-title">Upload Token Image</p>
        <p className="upload-description">
          This image will be used as the Token Icon. Image should be in the
          format of png or jpg which is less than 5 MB
        </p>
        <ImgCrop aspect={350 / 350} fillColor="transparent">
          <Upload maxCount={1} showUploadList={false} onChange={editCoverImage}>
            <Button className="upload-btn" icon={<UploadOutlined />}>
              Upload
            </Button>
          </Upload>
        </ImgCrop>
      </div>
      <div className="upload-preview">
        <div className="upload-image">
          <img
            src={previewUrl ? previewUrl : PreviewImage}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
        {!previewUrl && <div className="preview-text">Preview</div>}
      </div>
    </div>
  );
};

export default ImageUploader;
