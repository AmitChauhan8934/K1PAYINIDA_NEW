import { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
// @mui
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputAdornment,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  FormHelperText,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Api } from "src/webservices";
// import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFCodes,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { convertToWords } from "src/components/customFunctions/ToWords";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";

// ----------------------------------------------------------------------

type FormValuesProps = {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
  payAmount: string;
};

//--------------------------------------------------------------------

export default function DMT2pay(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { UpdateUserDetail } = useAuthContext();
  const [txn, setTxn] = useState(true);
  const [mode, setMode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [checkNPIN, setCheckNPIN] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [count, setCount] = useState<any>(null);
  const [transactionDetail, setTransactionDetail] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setConfirm(false);
    setCheckNPIN(false);
    setTxn(true);
  };

  //success Modal
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);

  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => {
    setOpen2(false);
    reset(defaultValues);
  };
  useEffect(() => {
    handleOpen2();
  }, [props.beneficiary]);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const DMTSchema = Yup.object().shape({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
    payAmount: Yup.string()
      .required("Amount is required field")
      .test(
        "is-greater-than-100",
        "Amount should be greater than 100",
        (value: any) => +value > 99
      )
      .test(
        "is-multiple-of-100",
        "Amount must be a multiple of 100",
        (value: any) => (+value > 5000 ? Number(value) % 100 === 0 : value)
      )
      .test(
        "is-less-than-max",
        "Limit Exceed ! available limit is " +
          props.remitter.dmt2RemitterAvailableLimit,
        (value: any) =>
          +value > props.remitter.dmt2RemitterAvailableLimit ? false : true
      ),
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
    payAmount: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
    mode: "all",
  });
  const {
    reset,
    setError,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (count !== null) {
      if (count > 0) {
        const timer = setInterval(() => {
          setCount((prevCount: any) => prevCount - 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        window.location.reload();
      }
    }
  }, [count]);

  const transaction = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      beneficiaryId: props.beneficiary._id,
      amount: data.payAmount,
      remitterId: props.remitter._id,
      mode: +mode,
      note1: "",
      note2: "",
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    {
      body.nPin && setCheckNPIN(true);
    }
    {
      body.nPin &&
        Api("dmt2/transaction", "POST", body, token).then((Response: any) => {
          console.log(
            "==============>>> register beneficiary Response",
            Response
          );
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              Response.data.response.map((element: any) => {
                enqueueSnackbar(element.message);
                UpdateUserDetail({
                  main_wallet_amount:
                    element?.data?.agentDetails?.newMainWalletBalance,
                });
              });
              setTransactionDetail(Response.data.response);
              handleClose();
              handleOpen1();
              setCount(5);
              setTxn(false);
              setErrorMsg("");
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
              setErrorMsg(Response.data.message);
            }
          } else {
            setCheckNPIN(false);
            enqueueSnackbar(Response, { variant: "error" });
          }
          setTxn(false);
          reset(defaultValues);
        });
    }
  };

  return (
    <>
      <Modal
        open={open2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          style={{ borderRadius: "20px" }}
          width={{ xs: "100%", sm: 400 }}
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(transaction)}>
            <Stack justifyContent={"space-between"} mb={2}>
              <Stack gap={1}>
                <Stack flexDirection={"row"} justifyContent={"space-between"}>
                  <Typography variant="subtitle2">Beneficiary Name</Typography>
                  <Typography variant="subtitle2">
                    {props.beneficiary.beneName}
                  </Typography>
                </Stack>
                <Stack flexDirection={"row"} justifyContent={"space-between"}>
                  <Typography variant="subtitle2"> Bank Name</Typography>
                  <Typography variant="subtitle2">
                    {props.beneficiary.bankName}
                  </Typography>
                </Stack>
                <Stack flexDirection={"row"} justifyContent={"space-between"}>
                  <Typography variant="subtitle2"> Account Number</Typography>
                  <Typography variant="subtitle2">
                    {props.beneficiary.accountNumber}
                  </Typography>
                </Stack>
                <Stack flexDirection={"row"} justifyContent={"space-between"}>
                  <Typography variant="subtitle2">IFSC</Typography>
                  <Typography variant="subtitle2">
                    {props.beneficiary.ifsc}
                  </Typography>
                </Stack>
              </Stack>

              <RHFTextField
                sx={{ marginTop: "20px", maxWidth: "500px" }}
                aria-autocomplete="none"
                name="payAmount"
                label="Enter Amount"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
              <FormControl style={{ display: "flex" }}>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  value={mode}
                  onChange={(event, value) => setMode(value)}
                  name="radiobuttonsgroup"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "10px",
                  }}
                >
                  <FormControlLabel
                    sx={{ color: "inherit" }}
                    name="NEFT"
                    value="1"
                    control={<Radio />}
                    label="NEFT"
                  />
                  <FormControlLabel
                    value="2"
                    name="IMPS"
                    control={<Radio />}
                    label="IMPS"
                  />
                </RadioGroup>
              </FormControl>
              <Stack flexDirection={"row"} gap={1}>
                <Button
                  onClick={() => {
                    handleClose1();
                    handleOpen();
                  }}
                  variant="contained"
                  sx={{ mt: 1 }}
                  disabled={
                    !mode ||
                    !(+watch("payAmount") > 5000
                      ? +watch("payAmount") % 100 === 0
                        ? true
                        : false
                      : +watch("payAmount") < 100
                      ? false
                      : true) ||
                    !(+watch("payAmount") >
                    props.remitter.dmt2RemitterAvailableLimit
                      ? false
                      : true)
                  }
                >
                  Pay Now
                </Button>
                <Button
                  onClick={handleClose2}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
            <Typography textAlign="end">
              {convertToWords(+watch("payAmount"))}
            </Typography>
          </FormProvider>
        </Box>
      </Modal>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {checkNPIN ? (
          txn ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={"fit-content"}
            >
              <Icon
                icon="eos-icons:bubble-loading"
                color="red"
                fontSize={300}
                style={{ padding: 25 }}
              />
            </Box>
          ) : errorMsg ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ xs: "100%", sm: 400 }}
            >
              <Stack flexDirection={"column"} alignItems={"center"}>
                <Typography variant="h3">Transaction Failed</Typography>
                <Icon
                  icon="heroicons:exclaimation-circle"
                  color="red"
                  fontSize={70}
                />
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography
                  variant="h4"
                  textAlign={"center"}
                  color={"#9e9e9ef0"}
                >
                  {errorMsg}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"center"}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ xs: "100%", sm: 400 }}
            ></Box>
          )
        ) : (
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            width={{ xs: "100%", sm: 450 }}
            minWidth={350}
          >
            <Typography variant="h4" textAlign={"center"}>
              Confirm Details
            </Typography>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Beneficiary Name</Typography>
              <Typography variant="body1">
                {props.beneficiary.beneName}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Bank Name</Typography>
              <Typography variant="body1">
                {props.beneficiary.bankName}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Account Number</Typography>
              <Typography variant="body1">
                {props.beneficiary.accountNumber}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">IFSC code</Typography>
              <Typography variant="body1">{props.beneficiary.ifsc}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Mobile Number</Typography>
              <Typography variant="body1">
                {props.beneficiary.mobileNumber || "-"}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Transaction Amount</Typography>
              <Typography variant="body1">₹{getValues("payAmount")}</Typography>
            </Stack>
            {confirm && (
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(transaction)}
              >
                <Stack
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  mt={2}
                  gap={2}
                >
                  <Typography variant="h4">Confirm NPIN</Typography>
                  <RHFCodes
                    keyName="otp"
                    inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                    type="password"
                  />

                  {(!!errors.otp1 ||
                    !!errors.otp2 ||
                    !!errors.otp3 ||
                    !!errors.otp4 ||
                    !!errors.otp5 ||
                    !!errors.otp6) && (
                    <FormHelperText error sx={{ px: 2 }}>
                      Code is required
                    </FormHelperText>
                  )}
                  <Stack flexDirection={"row"} gap={1} mt={2}>
                    <Button variant="contained" type="submit">
                      Yes, Continue
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleClose}
                    >
                      Close{" "}
                    </Button>
                  </Stack>
                </Stack>
              </FormProvider>
            )}
            {!confirm && (
              <Stack flexDirection={"row"} gap={1} mt={2}>
                <Button variant="contained" onClick={() => setConfirm(true)}>
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Modal>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "20px" }} width={"fit-content"}>
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            p={2}
            width={{ xs: "100%", sm: "fit-content" }}
          >
            <Stack
              sx={{ border: "1.5px dashed #000000" }}
              p={3}
              borderRadius={2}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                style={{ borderBottom: "1px solid #dadada" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                      Client ref Id
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                      Created At
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                      status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionDetail.map((item: any) => (
                    <TableRow key={item.data._id}>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {item.data.clientRefId || "NA"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {fDateTime(item?.data?.createdAt)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {item.data.amount && "₹"} {item.data.amount || "NA"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {item.data.status || "NA"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
            <Stack
              flexDirection={"row"}
              gap={1}
              mt={1}
              justifyContent={"center"}
            >
              {/* <Button variant="contained" onClick={handleClose1} size="small">
                Download Receipt
              </Button> */}
              <Button variant="contained">Close({count})</Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
