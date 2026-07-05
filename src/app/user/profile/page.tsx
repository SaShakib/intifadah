import { PageStack } from '@/components/custom/PageStack';
import { ProfileBottomSection, ProfileMiddleSection, ProfileTopSection } from './_sections';

export default function ProfilePage() {
  return (
    <PageStack>
      <ProfileTopSection />
      <ProfileMiddleSection />
      <ProfileBottomSection />
    </PageStack>
  );
}
