import { Button } from "@/src/components/button";
import { ScrollView, Text, View } from "react-native";

export default function StoryScreen() {
  return (
    <View className="flex-1 w-full items-center bg-main-bg p-4 gap-4">
      <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
        <Text className="text-text-color text-base px-4 py-2">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur
          culpa omnis optio. Incidunt blanditiis voluptatum ea aspernatur ullam
          repudiandae earum vel dolorem neque recusandae itaque, quos nisi
          doloribus esse odit. Lorem ipsum dolor sit amet consectetur,
          adipisicing elit. Doloremque pariatur ad porro obcaecati hic ipsa at,
          sint molestiae autem! Consequatur delectus esse nisi eos tempore et!
          Provident excepturi unde quaerat? Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Incidunt quam voluptate hic repellendus
          amet maxime cum alias. Veniam temporibus iure explicabo facilis,
          architecto dignissimos illo quibusdam quaerat delectus harum nesciunt?
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur
          culpa omnis optio. Incidunt blanditiis voluptatum ea aspernatur ullam
          repudiandae earum vel dolorem neque recusandae itaque, quos nisi
          doloribus esse odit. Lorem ipsum dolor sit amet consectetur,
          adipisicing elit. Doloremque pariatur ad porro obcaecati hic ipsa at,
          sint molestiae autem! Consequatur delectus esse nisi eos tempore et!
          Provident excepturi unde quaerat? Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Incidunt quam voluptate hic repellendus
          amet maxime cum alias. Veniam temporibus iure explicabo facilis,
          architecto dignissimos illo quibusdam quaerat delectus harum nesciunt?
        </Text>
      </ScrollView>
      <View className="flex flex-1 w-full flex-row gap-4 justify-between">
        <Button className="flex-1 h-full">
          <Text className="text-text-color text-base overflow-hidden">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Necessitatibus recusandae itaque pariatur dolorum consequuntur odio
            fuga voluptatem blanditiis neque architecto ea sed sequi, possimus
            amet vitae officiis doloribus doloremque aliquam.
          </Text>
        </Button>
        <Button className="flex-1 h-full">
          <Text className="text-text-color text-base overflow-hidden">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Necessitatibus recusandae itaque pariatur dolorum consequuntur odio
            fuga voluptatem blanditiis neque architecto ea sed sequi, possimus
            amet vitae officiis doloribus doloremque aliquam.
          </Text>
        </Button>
      </View>
    </View>
  );
}
