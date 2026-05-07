import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer as SheetDrawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectDrawer,
  type SelectOption,
  SelectTrigger,
  Separator,
  Skeleton,
  Text,
  Toggle,
  useToast,
} from '@/components/ui';
import { ScreenLayout } from '@/src/app';

const ASSET_OPTIONS: SelectOption[] = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'sol', label: 'Solana (SOL)', disabled: true },
];

export function PlaygroundScreen() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [demoDefault, setDemoDefault] = useState('');
  const [demoDestructive, setDemoDestructive] = useState('');
  const [selectModal, setSelectModal] = useState<string | undefined>('btc');
  const [selectDrawerValue, setSelectDrawerValue] = useState<
    string | undefined
  >('eth');
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <ScreenLayout
      className="bg-background"
      contentClassName="gap-6 px-4 pb-16 pt-4"
    >
      <View className="gap-2">
        <Text variant="title">Playground documentation</Text>
        <Text variant="subtitle">
          Living reference of component construction patterns (no business logic).
        </Text>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>01 · Foundations / Card + Text</CardTitle>
          <CardDescription>
            CardHeader, CardTitle, CardDescription, CardContent y CardFooter.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Text variant="title">Text · title</Text>
          <Text variant="cardTitle">Text · cardTitle</Text>
          <Text variant="default">Text · default (base)</Text>
          <Text variant="subtitle">Text · subtitle</Text>
          <Text variant="muted">Text · muted</Text>
          <Separator />
          <Text className="text-center text-base text-card-foreground">
            {t('welcome')}
          </Text>
        </CardContent>
        <CardFooter>
          <Text variant="muted" className="text-center">
            Pie de tarjeta (CardFooter)
          </Text>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>02 · Overlays / Dialog</CardTitle>
          <CardDescription>Modal centrado (patrón shadcn).</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Dialog>
            <DialogTrigger>
              <View className="items-center justify-center rounded-md border border-input bg-background px-4 py-3">
                <Text className="font-medium text-foreground">
                  Abrir dialog
                </Text>
              </View>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar acción</DialogTitle>
                <DialogDescription>
                  Los dialogs usan Modal + overlay. Cierra tocando fuera o el
                  botón.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose>
                  <View className="rounded-md bg-primary px-4 py-3">
                    <Text className="text-center font-medium text-primary-foreground">
                      Entendido
                    </Text>
                  </View>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>03 · Overlays / Bottom sheet</CardTitle>
          <CardDescription>
            Hoja inferior (UI). No es el menú lateral del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <SheetDrawer>
            <DrawerTrigger>
              <View className="items-center justify-center rounded-md bg-secondary px-4 py-3">
                <Text className="font-medium text-secondary-foreground">
                  Abrir drawer
                </Text>
              </View>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Detalle</DrawerTitle>
                <DrawerDescription>
                  Contenido deslizable desde abajo, con handle y overlay.
                </DrawerDescription>
              </DrawerHeader>
              <View className="gap-2 px-1 py-2">
                <Text className="text-base text-foreground">Opción A</Text>
                <Text className="text-base text-foreground">Opción B</Text>
              </View>
              <DrawerFooter>
                <DrawerClose>
                  <View className="w-full rounded-md border border-input bg-secondary px-4 py-3">
                    <Text className="text-center font-medium text-secondary-foreground">
                      Cerrar drawer
                    </Text>
                  </View>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </SheetDrawer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>04 · Feedback / Toast</CardTitle>
          <CardDescription>useToast / toast() con variantes.</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Button
            accessibilityRole="button"
            variant="secondary"
            onPress={() =>
              toast({
                title: 'Guardado',
                description: 'Cambios aplicados correctamente.',
              })
            }
          >
            <Text className="font-medium text-secondary-foreground">
              Toast default
            </Text>
          </Button>
          <Button
            accessibilityRole="button"
            variant="destructive"
            onPress={() =>
              toast({
                title: 'Algo salió mal',
                description: 'Revisa la red o vuelve a intentar.',
                variant: 'destructive',
              })
            }
          >
            <Text className="font-medium text-destructive-foreground">
              Toast destructive
            </Text>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>05 · Forms / Toggle</CardTitle>
          <CardDescription>
            Switch estilizado (checked / onCheckedChange).
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="flex flex-row items-center justify-between gap-4">
            <Label nativeID="toggle-push">Notificaciones push</Label>
            <Toggle
              nativeID="toggle-push"
              accessibilityLabel="Notificaciones push"
              checked={pushEnabled}
              onCheckedChange={setPushEnabled}
            />
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>06 · Forms / Select (modal)</CardTitle>
          <CardDescription>
            Lista en sheet inferior; opción deshabilitada.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Select
            value={selectModal}
            onValueChange={setSelectModal}
            options={ASSET_OPTIONS}
            placeholder="Elige un activo"
          >
            <SelectTrigger />
            <SelectContent title="Activos (modal)" />
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>07 · Forms / Select (drawer)</CardTitle>
          <CardDescription>
            Misma data; UI sobre Drawer (sheet con handle).
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <SelectDrawer
            value={selectDrawerValue}
            onValueChange={setSelectDrawerValue}
            options={ASSET_OPTIONS}
            placeholder="Elige en drawer"
            title="Activos (drawer)"
            description="Cierra con la fila inferior o al elegir un activo."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>08 · Feedback / Skeleton</CardTitle>
          <CardDescription>Placeholders con animate-pulse.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex flex-row items-center gap-3">
            <Skeleton shape="circle" className="h-12 w-12" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-3 w-[50%]" />
            </View>
          </View>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>09 · Data display / Badge</CardTitle>
          <CardDescription>Todas las variantes.</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="flex flex-row flex-wrap gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge variant="outline">outline</Badge>
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10 · Layout / Separator</CardTitle>
          <CardDescription>Horizontal y vertical.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <Text variant="muted">Horizontal</Text>
          <Separator />
          <Text variant="muted">Vertical (entre columnas)</Text>
          <View className="h-20 flex-row items-stretch rounded-md border border-border">
            <View className="flex-1 items-center justify-center px-2">
              <Text className="text-center text-sm text-muted-foreground">
                A
              </Text>
            </View>
            <Separator orientation="vertical" decorative={false} />
            <View className="flex-1 items-center justify-center px-2">
              <Text className="text-center text-sm text-muted-foreground">
                B
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11 · Forms / Label + Input</CardTitle>
          <CardDescription>Variantes default y destructive.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-2">
            <Label nativeID="field-default">Campo default</Label>
            <Input
              accessibilityLabel="Campo default"
              nativeID="field-default"
              value={demoDefault}
              onChangeText={setDemoDefault}
              placeholder="Escribe algo…"
              variant="default"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="field-destructive">Campo destructive</Label>
            <Input
              accessibilityLabel="Campo destructive"
              nativeID="field-destructive"
              value={demoDestructive}
              onChangeText={setDemoDestructive}
              placeholder="Estado de error visual…"
              variant="destructive"
            />
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12 · Actions / Button variants</CardTitle>
          <CardDescription>
            default, destructive, outline, secondary, ghost, link.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Button accessibilityRole="button" variant="default">
            <Text className="font-medium text-primary-foreground">default</Text>
          </Button>
          <Button accessibilityRole="button" variant="destructive">
            <Text className="font-medium text-destructive-foreground">
              destructive
            </Text>
          </Button>
          <Button accessibilityRole="button" variant="outline">
            <Text className="font-medium text-foreground">outline</Text>
          </Button>
          <Button accessibilityRole="button" variant="secondary">
            <Text className="font-medium text-secondary-foreground">
              secondary
            </Text>
          </Button>
          <Button accessibilityRole="button" variant="ghost">
            <Text className="font-medium text-foreground">ghost</Text>
          </Button>
          <Button accessibilityRole="button" variant="link">
            <Text className="font-medium text-primary underline">link</Text>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13 · Actions / Button sizes</CardTitle>
          <CardDescription>sm, default, lg e icon.</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="flex flex-row flex-wrap items-center gap-2">
            <Button accessibilityRole="button" size="sm" variant="secondary">
              <Text className="text-sm font-medium text-secondary-foreground">
                sm
              </Text>
            </Button>
            <Button
              accessibilityRole="button"
              size="default"
              variant="secondary"
            >
              <Text className="font-medium text-secondary-foreground">
                default
              </Text>
            </Button>
            <Button accessibilityRole="button" size="lg" variant="secondary">
              <Text className="font-medium text-secondary-foreground">lg</Text>
            </Button>
            <Button accessibilityRole="button" size="icon" variant="outline">
              <Text className="text-lg text-foreground">＋</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </ScreenLayout>
  );
}
