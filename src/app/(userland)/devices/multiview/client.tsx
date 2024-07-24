"use client";

import { getRedroidImage } from "%/device-info/redroid-images.ts";
import { Breadcrumbs } from "@/app/(userland)/devices/multiview/breadcrumbs.tsx";
import {
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  MAX_SIZE,
} from "@/app/(userland)/devices/multiview/constants.ts";
import DeviceClientWithButtons from "@/components/client/device-client-with-buttons.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import type { Device } from "@prisma/client";
import { ChevronsUpDown, Minus, Plus } from "lucide-react";
import { Fragment, useState } from "react";
import { LuRefreshCw } from "react-icons/lu";
import { TbGrid3X3 } from "react-icons/tb";

function ResizableControlButtons(props: {
  columns: number;
  addColumn: () => void;
  removeColumn: () => void;
  rows: number;
  addRow: () => void;
  removeRow: () => void;
}) {
  return (
    <div className="inline-flex space-x-4 w-full">
      <div className="flex items-center">
        <h2 className="mr-2">Columns: {props.columns}</h2>
        <Button onClick={props.addColumn} size="sm" className="mr-1">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={props.removeColumn} size="sm" variant="outline">
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center">
        <h2 className="mr-2">Rows: {props.rows}</h2>
        <Button onClick={props.addRow} size="sm" className="mr-1">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={props.removeRow} size="sm" variant="outline">
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ResizableControlDialog(props: {
  columns: number;
  addColumn: () => void;
  removeColumn: () => void;
  rows: number;
  addRow: () => void;
  removeRow: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          {" "}
          {/*im opting against using outline here as I want there to be clear contrast*/}
          <TbGrid3X3 className="mr-2 h-4 w-4" />
          Resize Grid
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Resize Grid</DialogTitle>
        <div className="mt-4">
          <ResizableControlButtons
            columns={props.columns}
            addColumn={props.addColumn}
            removeColumn={props.removeColumn}
            rows={props.rows}
            addRow={props.addRow}
            removeRow={props.removeRow}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeviceSelector({
  devices,
  setDevice,
  className,
}: Readonly<{
  devices: Device[];
  setDevice: (device: Device) => void;
  className?: string;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[500px] justify-between mx-3"
        >
          Select Device...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0">
        <Command>
          <CommandInput placeholder="Search your devices..." />
          <CommandList>
            <CommandEmpty>No such device exists.</CommandEmpty>
            <CommandGroup>
              {devices.map((device) => {
                const redroidImage = getRedroidImage(device.redroidImage)!;

                return (
                  <CommandItem
                    key={device.id}
                    onSelect={() => {
                      setDevice(device);
                      setOpen(false);
                    }}
                  >
                    {device.name} ({redroidImage.name})
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function DeviceView({ devices }: Readonly<{ devices: Device[] }>) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  if (!selectedDevice) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <DeviceSelector devices={devices} setDevice={setSelectedDevice} />
      </div>
    );
  }

  return (
    <DeviceClientWithButtons
      outerMostClassName={"h-full"}
      widthLimiterClassName={"h-full"}
      fullscreenInnerContainerClassName={"h-full"}
      forceFullScreenHandling
      device={selectedDevice}
      optionalAudio
      optionalKeyboardCapture
    />
  );
}

// i am deliberately allowing the same device to be selected multiple times. it would be an absolute nightmare to manage the state of the selected devices otherwise

export function Multiview({ devices }: Readonly<{ devices: Device[] }>) {
  // used to rerender all clients
  const [globalKey, setGlobalKey] = useState(0);

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState(DEFAULT_ROWS);

  const addColumn = () => setColumns((c) => Math.min(MAX_SIZE, c + 1));
  const removeColumn = () => setColumns((c) => Math.max(1, c - 1));
  const addRow = () => setRows((r) => Math.min(MAX_SIZE, r + 1));
  const removeRow = () => setRows((r) => Math.max(1, r - 1));

  // Calculate default sizes for columns and rows
  const defaultColumnSize = 100 / columns;
  const defaultRowSize = 100 / rows;

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs />
      <div className="flex justify-between mb-4 space-x-4">
        <div>
          <h1 className="shadcn-h1">Multiview</h1>
        </div>

        <div className="space-x-4 content-center">
          <Button
            variant="secondary"
            onClick={() => setGlobalKey(globalKey + 1)}
          >
            <LuRefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <ResizableControlDialog
            columns={columns}
            addColumn={addColumn}
            removeColumn={removeColumn}
            rows={rows}
            addRow={addRow}
            removeRow={removeRow}
          />
        </div>
      </div>

      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[90vh] rounded-lg border"
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Fragment key={rowIndex}>
            <ResizablePanel
              id={`row-${rowIndex}`}
              order={rowIndex + 1}
              defaultSize={defaultRowSize}
              minSize={100 / (MAX_SIZE + 1)}
            >
              <ResizablePanelGroup direction="horizontal">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Fragment key={colIndex}>
                    <ResizablePanel
                      id={`row-${rowIndex}-col-${colIndex}`}
                      order={colIndex + 1}
                      defaultSize={defaultColumnSize}
                      minSize={100 / (MAX_SIZE + 1)}
                    >
                      <DeviceView devices={devices} key={globalKey} />
                    </ResizablePanel>
                    {colIndex < columns - 1 && <ResizableHandle withHandle />}
                  </Fragment>
                ))}
              </ResizablePanelGroup>
            </ResizablePanel>
            {rowIndex < rows - 1 && <ResizableHandle withHandle />}
          </Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
