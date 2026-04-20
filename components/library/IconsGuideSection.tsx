import { Icon } from "@/components/icons/Icon";
import { LibrarySectionCard } from "@/components/library/LibrarySectionCard";

type IconsGuideSectionProps = {
  id: string;
};

export function IconsGuideSection({ id }: IconsGuideSectionProps) {
  return (
    <LibrarySectionCard
      id={id}
      title="Icons (Sprite + Use)"
      description="สร้าง sprite หนึ่งครั้ง แล้วเรียกใช้ผ่าน Icon component เพื่อลดการเขียน SVG ซ้ำ"
    >
      <div className="mb-4 flex items-center gap-4 rounded-xl bg-[#0B0B0F] p-4 text-white">
        <Icon name="eye" className="h-5 w-5" />
        <Icon name="eye-off" className="h-5 w-5" />
        <Icon name="chevron-down" className="h-5 w-5" />
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="mb-1 font-medium text-base-content/70">
            1) เอา SVG ไปใส่ใน `components/icons/SvgSprite.tsx`
          </p>
          <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`// ภายใน <svg> ของ SvgSprite.tsx ให้เพิ่ม <symbol>
<symbol id="icon-your-name" viewBox="0 0 24 24">
  <path d="M6 9L12 15L18 9" fill="none" stroke="currentColor" strokeWidth="1.8" />
</symbol>

// ตั้งชื่อ id ให้ตรง pattern: icon-...`}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-medium text-base-content/70">
            2) ตอนนี้ `Icon` รับ `name: string` ได้เลย (ไม่ต้องแก้ type ทุกครั้ง)
          </p>
          <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`type IconProps = {
  name: string;
  className?: string;
};`}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-medium text-base-content/70">
            3) เรียก <code>{`<SvgSprite />`}</code> ที่{" "}
            <code>app/layout.tsx</code> แค่ครั้งเดียว
          </p>
          <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`import { SvgSprite } from "@/components/icons/SvgSprite";

<body>
  <SvgSprite />
  {children}
</body>`}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-medium text-base-content/70">
            4) ใช้งาน icon ด้วย <code>{`<Icon />`}</code>
          </p>
          <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`import { Icon } from "@/components/icons/Icon";

<Icon name="your-name" className="h-5 w-5" />`}
          </pre>
        </div>
      </div>
    </LibrarySectionCard>
  );
}
