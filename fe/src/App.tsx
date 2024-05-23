import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import BarChart from "./BarChart";
import useScan from "./useScan";

type Inputs = {
  url: string;
};

const App: React.FC = () => {
  const { getTableNumeric, error, tableLabel, tableData } = useScan();
  console.log("🚀 ~ tableData:", tableData);
  console.log("🚀 ~ tableLabel:", tableLabel);
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      url: "https://en.wikipedia.org/wiki/Women%27s_high_jump_world_record_progression",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    getTableNumeric(data.url);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("url")} style={{ width: "500px" }} />
        <input type="submit" />
      </form>
      {error && <div>{error?.message}</div>}
      {tableData.length > 0 && tableLabel.length > 0 && (
        <div>
          <h1>Chart</h1>
          <BarChart labels={tableLabel} data={tableData} />
        </div>
      )}
    </div>
  );
};

export default App;
